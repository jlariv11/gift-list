import {VercelRequest, VercelResponse} from '@vercel/node'
import prismaClient from "../../../lib/prisma"
import {nanoid} from "nanoid";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const data = req.body;
    const ownerID = data.ownerID ? data.ownerID : nanoid();

    try {
        const itemIDs: number[] = [];

        await prismaClient.$transaction(async (tx) => {
            await tx.list.upsert({
                where: { ownerID },
                update: { listName: data.listName },
                create: {
                    ownerID,
                    listName: data.listName,
                },
            });

            for (const item of data.items) {
                if (item.itemID) {
                    await tx.item.update({
                        where: { itemID: item.itemID },
                        data: {
                            itemName: item.itemName,
                            itemQuantity: item.itemQuantity,
                            itemQuantityPurchased: item.itemQuantityPurchased,
                            itemLink: item.itemLink,
                            itemImageURL: item.itemImageURL,
                            itemDescription: item.itemDescription,
                        },
                    });
                    itemIDs.push(item.itemID);
                } else {
                    const newItem = await tx.item.create({
                        data: {
                            ownerID,
                            itemName: item.itemName,
                            itemQuantity: item.itemQuantity,
                            itemQuantityPurchased: item.itemQuantityPurchased,
                            itemLink: item.itemLink,
                            itemImageURL: item.itemImageURL,
                            itemDescription: item.itemDescription,
                        },
                    });
                    itemIDs.push(newItem.itemID);
                }
            }
        });

        res.status(200).json({ ownerID, itemIDs });
    } catch (err) {
        console.error(err);
        res.status(500).json("Failed to create list and items");
    }
}
