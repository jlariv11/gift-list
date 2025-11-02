import {VercelRequest, VercelResponse} from '@vercel/node'
import prismaClient from "../../../lib/prisma"

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const data = req.body;
    try {
        await prismaClient.$transaction(async (tx) => {
            for (const item of data.items) {
                if (item.itemID) {
                    await tx.item.update({
                        where: { itemID: item.itemID },
                        data: {
                            itemQuantityPurchased: item.itemQuantityPurchased,
                        },
                    });
                }
            }
        });

        res.status(200).json("Successful Save");
    } catch (err) {
        console.error(err);
        res.status(500).json("Failed to update purchased items");
    }
}
