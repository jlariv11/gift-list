import { Router } from "express";
import prismaClient from "../database/prisma";

const router = Router();

router.delete("/", async (req, res) => {
    const { itemIDs } = req.body;

    if (!Array.isArray(itemIDs)) {
        return res.status(400).json({
            error: "itemIDs must be an array"
        });
    }

    try {
        await prismaClient.item.deleteMany({
            where: {
                itemID: {
                    in: itemIDs
                }
            }
        });

        res.status(200).json({});
    } catch (err) {
        console.error(err);

        res.status(500).json({
            error: "Failed to delete items"
        });
    }
});

export default router;