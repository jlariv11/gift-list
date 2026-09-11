import { Router } from "express";
import prismaClient from "../database/prisma";
import {nanoid} from "nanoid";
import {optionalAccessToken, validateAccessToken} from "../middleware/auth0";

const router = Router();

interface ItemData {
    itemName: string;
    itemQuantity: number;
    itemLink?: string;
    itemImageURL?: string;
    itemDescription?: string;
}

router.post("/", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;

    try {
        await prismaClient.list.create({
            data: {
                ownerID: nanoid(),
                listName: "Test 1",
                auth0Sub: auth0Sub,
            }
        });
        return res.status(201).json({message: "Successfully created list"});
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to create list",
        });
    }
});

router.post("/save", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const listName = req.body.listName;
    const newList = req.body.newList;
    const items = req.body.items;
    console.log(listName);
    console.log(newList);
    console.log(items);

    const result = await prismaClient.$transaction(async (tx) => {

        const list = await tx.list.create({
            data: {
                ownerID: nanoid(),
                listName: listName,
                auth0Sub: newList ? auth0Sub : null,
            }
        });

        const newItems = await tx.item.createManyAndReturn({
            data: items.map((item: ItemData) => ({
                ownerID: list.ownerID,
                itemName: item.itemName,
                itemQuantity: item.itemQuantity,
                itemLink: item.itemLink,
                itemImageURL: item.itemImageURL,
                itemDescription: item.itemDescription,
            })),
        });
        return res.status(201).json({ownerID: list.ownerID, itemIDs: newItems.map(item => item.itemID)});
    });
})

export default router;