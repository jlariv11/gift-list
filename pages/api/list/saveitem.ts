import {VercelRequest, VercelResponse} from '@vercel/node'
import prismaClient from "../../../lib/prisma"

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const data = req.body;
    const ownerID = data.ownerID;
    const item = data.item;

    try {
        const newItem = await prismaClient.item.create({
            data: {
                ownerID,
                itemName: item.itemName,
                itemQuantity: item.itemQuantity,
                itemQuantityPurchased: item.itemQuantityPurchased,
                itemLink: item.itemLink,
                itemImageURL: item.itemImageURL,
                itemDescription: item.itemDescription,
                alternateForId: item.alternateID
            },
        });
        res.status(200).json({itemID: newItem.itemID});
    } catch (err) {
        console.error(err);
        res.status(500).json("Failed to create list and items");
    }
}
