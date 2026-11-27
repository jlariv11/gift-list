import { Router } from "express";
import prismaClient from "../database/prisma";
import {nanoid} from "nanoid";
import {optionalAccessToken} from "../middleware/auth0";
import {ApiError, handleApiError} from "../utils/APIResponse";
import {checkListAccess} from "../utils/AccessKeyCheck";

const router = Router();

router.post("/", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const listName = req.body?.listName ?? "Untitled List";

    if (typeof listName !== "string" || !listName.trim()) {
        return res.status(400).json({
            error: "A valid listName is required.",
        });
    }

    try {
        const list = await prismaClient.list.create({
            data: {
                ownerID: nanoid(),
                listName: listName.trim(),
                auth0Sub: auth0Sub,
            }
        });
        return res.status(201).json({ownerID: list.ownerID});
    } catch (error) {
        return handleApiError(res, error);
    }
});


router.patch("/:ownerID", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { ownerID } = req.params;
    const { listName, onlyThisAccount } = req.body ?? {};

    if (typeof ownerID !== "string" || !ownerID.trim()) {
        return res.status(400).json({
            error: "A valid ownerID is required.",
        });
    }

    // Both fields are optional, but at least one must be provided.
    if (listName === undefined && onlyThisAccount === undefined) {
        return res.status(400).json({
            error: "At least one field must be provided.",
        });
    }

    if (
        listName !== undefined &&
        (typeof listName !== "string" || !listName.trim())
    ) {
        return res.status(400).json({
            error: "A valid listName is required.",
        });
    }

    if (
        onlyThisAccount !== undefined &&
        typeof onlyThisAccount !== "boolean"
    ) {
        return res.status(400).json({
            error: "onlyThisAccount must be a boolean.",
        });
    }

    try {
        // Enforces existing owner-link/account access rules.
        await checkListAccess(auth0Sub, ownerID);

        const list = await prismaClient.list.findUnique({
            where: { ownerID },
            select: {
                auth0Sub: true,
            },
        });

        if (!list) {
            throw new ApiError(404, "List not found.");
        }

        // Only an authenticated owner can change this setting.
        if (onlyThisAccount !== undefined) {
            if (!list.auth0Sub || list.auth0Sub !== auth0Sub) {
                throw new ApiError(
                    403,
                    "Only the account owner can change this setting."
                );
            }
        }

        const updatedList = await prismaClient.list.update({
            where: { ownerID },
            data: {
                ...(listName !== undefined && {
                    listName: listName.trim(),
                }),
                ...(onlyThisAccount !== undefined && {
                    onlyThisAccount,
                }),
            },
            select: {
                listName: true,
                onlyThisAccount: true,
            },
        });

        return res.status(200).json(updatedList);
    } catch (error) {
        return handleApiError(res, error);
    }
});


router.get("/load", optionalAccessToken, async (req, res) => {
    const ownerID = typeof req.query.ownerID === "string" ? req.query.ownerID : null;
    const shareID = typeof req.query.shareID === "string" ? req.query.shareID : null;
    const auth0Sub = req.auth?.payload?.sub ?? null;

    if (!ownerID && !shareID) {
        return res.status(400).json({
            error: "Either ownerID or shareID is required.",
        });
    }

    try {
        let listData = null
        if(ownerID) {
            await checkListAccess(auth0Sub, ownerID);
            listData = await prismaClient.list.findUnique({
                where: {ownerID: ownerID},
                select: {
                    listName: true,
                    ownerID: true,
                    shareID: true,
                    onlyThisAccount: true,
                    // Everything auth0Sub
                    Item: {
                        select: {
                            itemID: true,
                            itemName: true,
                            itemQuantity: true,
                            itemLink: true,
                            itemImageURL: true,
                            itemDescription: true,
                        },
                    },
                }
            })
        }else if(shareID) {
            listData = await prismaClient.list.findUnique({
                where: { shareID },
                select: {
                    listName: true,
                    shareID: true,
                    // Everything except ownerID & auth0Sub
                    Item: {
                        where: {
                            itemQuantity: {
                                gt: prismaClient.item.fields.itemQuantityPurchased,
                            },
                        },
                        select: {
                            itemID: true,
                            itemName: true,
                            itemQuantity: true,
                            itemQuantityPurchased: true,
                            itemLink: true,
                            itemImageURL: true,
                            itemDescription: true,
                        },
                    },
                },
            });
        }
        if(!listData)
            throw new ApiError(404, "List not found.");
        return res.status(200).json(listData);
    }catch(error) {
        return handleApiError(res, error);
    }
})

router.get("/shareid", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const ownerID = typeof req.query.ownerID === "string" ? req.query.ownerID : null;

    if (!ownerID?.trim()) {
        return res.status(400).json({
            error: "ownerID is required.",
        });
    }

    try {
        await checkListAccess(auth0Sub, ownerID);

        const list = await prismaClient.list.findUnique({
            where: { ownerID },
            select: { shareID: true },
        });

        return res.status(200).json({
            shareID: list?.shareID,
        });
    } catch (error) {
        return handleApiError(res, error);
    }
});

router.post("/createShareID", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const {ownerID} = req.body;

    try {
        await checkListAccess(auth0Sub, ownerID);
        const newShareID = nanoid();

        await prismaClient.list.updateMany({
            where: {
                ownerID,
                shareID: null,
            },
            data: {
                shareID: newShareID,
            },
        });

        const list = await prismaClient.list.findUnique({
            where: { ownerID },
            select: { shareID: true },
        });

        if (!list) {
            throw new ApiError(404, "List not found.");
        }

        return res.status(200).json({
            shareID: list.shareID,
        });
    } catch (error) {
        return handleApiError(res, error);
    }
});

router.delete("/delete", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { ownerID } = req.body;

    if (typeof ownerID !== "string" || !ownerID.trim()) {
        return res.status(400).json({
            error: "A valid ownerID is required.",
        });
    }

    try {
        await prismaClient.$transaction(async (tx) => {
            const list = await tx.list.findUnique({
                where: {
                    ownerID: ownerID,
                },
                select: {
                    auth0Sub: true,
                    shareID: true,
                }
            });

            if (!list) {
                throw new ApiError(404, "List not found.");
            }

            // Reject if the list belongs to a different authenticated user
            if (list.auth0Sub && list.auth0Sub !== auth0Sub) {
                throw new ApiError(403, "Unauthorized.");
            }

            await tx.item.deleteMany({
                where: {
                    ownerID: ownerID,
                },
            });

            if (!list) {
                throw new ApiError(404, "List not found.");
            }

            // Delete any attached shared lists
            if(list.shareID) {
                await tx.sharedList.deleteMany({
                    where: {
                        shareID: list.shareID,
                    },
                });
            }

            await tx.list.delete({
                where: {
                    ownerID: ownerID,
                },
            });
        });

        return res.status(204).send();

    } catch (error) {
        return handleApiError(res, error);
    }
});

export default router;