import { Router } from "express";
import prismaClient from "../database/prisma";
import {optionalAccessToken} from "../middleware/auth0";
import {nanoid} from "nanoid";
import {handleApiError} from "../utils/APIResponse";

const router = Router();

export interface Item {
    itemID: number | undefined;
    itemName: string;
    itemQuantity: number;
    itemQuantityPurchased: number | undefined;
    itemLink: string;
    itemImageURL: string | null;
    itemImageFile: FormData | undefined;
    itemDescription: string;
}

router.post("/save", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const ownerID = req.body.ownerID ?? null;
    const items = req.body.items;

    if (!ownerID)
        return res.status(500).json({error: "Owner ID does not exist"});

    const result = await prismaClient.$transaction(async (tx) => {
        const updatedItems = await Promise.all(
            items.map((item: Item) =>
                tx.item.upsert({
                    where: {
                        itemID: item.itemID ?? -1,
                    },
                    update: {
                        itemName: item.itemName,
                        itemQuantity: item.itemQuantity,
                        itemLink: item.itemLink,
                        itemImageURL: item.itemImageURL,
                        itemDescription: item.itemDescription,
                    },
                    create: {
                        ownerID: ownerID,
                        itemName: item.itemName,
                        itemQuantity: item.itemQuantity,
                        itemLink: item.itemLink,
                        itemImageURL: item.itemImageURL,
                        itemDescription: item.itemDescription,
                    },
                })
            )
        );

        return updatedItems;
    });

    return res.status(200).json({
        itemIDs: result.map(item => item.itemID),
    });
})


router.post("/savepurchases", async (req, res) => {
    const shareID = req.body.shareID ?? null;
    const items = req.body.items;
    try {
        await prismaClient.$transaction(async (tx) => {
            const ownerID = await tx.list.findUnique({ where: { shareID }, select: {ownerID: true} });
            if (!ownerID || !ownerID.ownerID)
                throw new Error("Owner ID does not exist for given shareID");

            for (const item of items){
                await tx.item.update({
                    where: {
                        ownerID: ownerID.ownerID,
                        itemID: item.itemID
                    },
                    data: {
                        itemQuantityPurchased: item.itemQuantityPurchased
                    }
                })
            }

        })
        return res.status(200).json("items updated successfully");
    } catch (error) {
        return handleApiError(res, error);
    }
});

router.delete("/delete", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { ownerID, itemIDs } = req.body;

    await prismaClient.$transaction(async (tx) => {
        await tx.item.deleteMany({
            where: {
                itemID: {
                    in: itemIDs,
                },
                ownerID: ownerID,
            },
        })
    });
    return res.status(200).json("items deleted successfully.");
})

export default router;