
import { Router } from "express";
import prismaClient from "../database/prisma";
import { optionalAccessToken } from "../middleware/auth0";
import { ApiError, handleApiError } from "../utils/APIResponse";
import { checkListAccess } from "../utils/AccessKeyCheck";

const router = Router();

interface ItemInput {
    itemID?: number;
    itemName: string;
    itemQuantity: number;
    itemLink: string;
    itemImageURL: string | null;
    itemDescription: string;
}

interface PurchaseInput {
    itemID: number;
    itemQuantityPurchased: number;
}

function isItemInput(value: unknown): value is ItemInput {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const item = value as Record<string, unknown>;

    return (
        (item.itemID === undefined ||
            (Number.isSafeInteger(item.itemID) &&
                (item.itemID as number) > 0)) &&
        typeof item.itemName === "string" &&
        item.itemName.trim().length > 0 &&
        Number.isSafeInteger(item.itemQuantity) &&
        (item.itemQuantity as number) > 0 &&
        typeof item.itemLink === "string" &&
        (item.itemImageURL === null ||
            typeof item.itemImageURL === "string") &&
        typeof item.itemDescription === "string"
    );
}

function isPurchaseInput(value: unknown): value is PurchaseInput {
    if (!value || typeof value !== "object" || Array.isArray(value)) {
        return false;
    }

    const item = value as Record<string, unknown>;

    return (
        Number.isSafeInteger(item.itemID) &&
        (item.itemID as number) > 0 &&
        Number.isSafeInteger(item.itemQuantityPurchased) &&
        (item.itemQuantityPurchased as number) >= 0
    );
}

// Create or update submitted items
router.post("/save", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { ownerID, items } = req.body ?? {};

    if (typeof ownerID !== "string" || !ownerID.trim()) {
        return res.status(400).json({
            error: "A valid ownerID is required.",
        });
    }

    if (!Array.isArray(items) || !items.every(isItemInput)) {
        return res.status(400).json({
            error: "Invalid items.",
        });
    }

    const existingIDs = items
        .filter((item: ItemInput) => item.itemID !== undefined)
        .map((item: ItemInput) => item.itemID as number);

    if (new Set(existingIDs).size !== existingIDs.length) {
        return res.status(400).json({
            error: "Duplicate item IDs are not allowed.",
        });
    }

    try {
        await checkListAccess(auth0Sub, ownerID);

        const updatedItems = await prismaClient.$transaction(async (tx) => {
            // Verify all existing items belong to this list.
            const existingItems = await tx.item.findMany({
                where: {
                    ownerID,
                    itemID: { in: existingIDs },
                },
                select: { itemID: true },
            });

            if (existingItems.length !== existingIDs.length) {
                throw new ApiError(
                    404,
                    "One or more items were not found in this list."
                );
            }

            const results = [];

            for (const item of items as ItemInput[]) {
                const data = {
                    itemName: item.itemName.trim(),
                    itemQuantity: item.itemQuantity,
                    itemLink: item.itemLink,
                    itemImageURL: item.itemImageURL,
                    itemDescription: item.itemDescription,
                };

                if (item.itemID !== undefined) {
                    const updated = await tx.item.updateMany({
                        where: {
                            itemID: item.itemID,
                            ownerID,
                        },
                        data,
                    });

                    if (updated.count !== 1) {
                        throw new ApiError(404, "Item not found.");
                    }

                    results.push({ itemID: item.itemID });
                } else {
                    const created = await tx.item.create({
                        data: {
                            ownerID,
                            ...data,
                        },
                    });

                    results.push({ itemID: created.itemID });
                }
            }

            return results;
        });

        return res.status(200).json({
            itemIDs: updatedItems.map(item => item.itemID),
        });
    } catch (error) {
        return handleApiError(res, error);
    }
});

// Update purchased quantities through a share link
router.patch("/savepurchases", async (req, res) => {
    const { shareID, items } = req.body ?? {};
    if (typeof shareID !== "string" || !shareID.trim()) {
        return res.status(400).json({
            error: "A valid shareID is required.",
        });
    }

    if (!Array.isArray(items) || !items.every(isPurchaseInput)) {
        return res.status(400).json({
            error: "Invalid purchase data.",
        });
    }

    const itemIDs = items.map((item: PurchaseInput) => item.itemID);

    if (new Set(itemIDs).size !== itemIDs.length) {
        return res.status(400).json({
            error: "Duplicate item IDs are not allowed.",
        });
    }

    try {
        await prismaClient.$transaction(async (tx) => {
            const list = await tx.list.findUnique({
                where: { shareID },
                select: { ownerID: true },
            });

            if (!list) {
                throw new ApiError(404, "Shared list not found.");
            }

            for (const item of items as PurchaseInput[]) {
                const updated = await tx.item.updateMany({
                    where: {
                        ownerID: list.ownerID,
                        itemID: item.itemID,
                        itemQuantity: {
                            gte: item.itemQuantityPurchased,
                        },
                    },
                    data: {
                        itemQuantityPurchased: item.itemQuantityPurchased,
                    },
                });

                if (updated.count !== 1) {
                    throw new ApiError(
                        409,
                        "Item not found or purchased quantity exceeds requested quantity."
                    );
                }
            }
        });

        return res.status(200).json({
            message: "Purchases updated successfully.",
        });
    } catch (error) {
        return handleApiError(res, error);
    }
});

// Delete selected items
router.delete("/delete", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { ownerID, itemIDs } = req.body ?? {};

    if (typeof ownerID !== "string" || !ownerID.trim()) {
        return res.status(400).json({
            error: "A valid ownerID is required.",
        });
    }

    if (
        !Array.isArray(itemIDs) ||
        !itemIDs.every(
            id => Number.isSafeInteger(id) && id > 0
        )
    ) {
        return res.status(400).json({
            error: "Invalid item IDs.",
        });
    }

    if (new Set(itemIDs).size !== itemIDs.length) {
        return res.status(400).json({
            error: "Duplicate item IDs are not allowed.",
        });
    }

    try {
        await checkListAccess(auth0Sub, ownerID);

        await prismaClient.$transaction(async (tx) => {
            const deleted = await tx.item.deleteMany({
                where: {
                    ownerID,
                    itemID: { in: itemIDs },
                },
            });

            if (deleted.count !== itemIDs.length) {
                throw new ApiError(
                    404,
                    "One or more items were not found in this list."
                );
            }
        });

        return res.status(204).send();
    } catch (error) {
        return handleApiError(res, error);
    }
});

export default router;
