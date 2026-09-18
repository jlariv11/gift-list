import { Router } from "express";
import prismaClient from "../database/prisma";
import {nanoid} from "nanoid";
import {optionalAccessToken, validateAccessToken} from "../middleware/auth0";
import prisma from "../database/prisma";

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
    const listName = req.body.listName ?? "Untitled List1";
    try {
        const list = await prismaClient.list.create({
            data: {
                ownerID: nanoid(),
                listName: listName,
                auth0Sub: auth0Sub,
            }
        });
        return res.status(201).json(list.ownerID);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to create list",
        });
    }
});

router.post("/updateName", async (req, res) => {
    //const auth0Sub = req.auth?.payload?.sub ?? null;
    const listName = req.body.listName ?? "Untitled List1";
    const ownerID = req.body.ownerID ?? null;
    try {
        const list = await prismaClient.list.update({
            where: {
                ownerID: ownerID,
            },
            data: {
                listName: listName,
            }
        });
        return res.status(200).json(list.listName);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to update list name",
        });
    }
});

router.get("/load", async (req, res) => {
    const ownerID = typeof req.query.ownerID === "string" ? req.query.ownerID : null;
    if (!ownerID)
        return res.status(500).json({error: "Owner ID does not exist"});
    try {
        const listData = await prismaClient.list.findUnique({
            where: { ownerID: ownerID },
            include: { Item: true },
        })
        return res.status(200).json(listData);
    }catch(error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to create list",
        });
    }
})

router.get("/shareid", async (req, res) => {
    //const auth0Sub = req.auth?.payload?.sub ?? null;
    const ownerID = req.body.ownerID ?? null;
    try {
        const list = await prismaClient.list.findUnique({
            where: {
                ownerID: ownerID,
            },
            select: {
                shareID: true,
            }
        });
        if(!list)
            return res.status(404).json({error: "List not found"})
        return res.status(200).json(list.shareID);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to update list name",
        });
    }
});

router.post("/createShareID", async (req, res) => {
    //const auth0Sub = req.auth?.payload?.sub ?? null;
    const ownerID = req.body.ownerID ?? null;
    try {
        const list = await prismaClient.list.update({
            where: {
                ownerID: ownerID,
            },
            data: {
                shareID: nanoid(),
            }
        });
        if(!list)
            return res.status(404).json({error: "List not found"})
        return res.status(200).json(list.shareID);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to update list name",
        });
    }
});

router.delete("/delete", optionalAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { ownerID } = req.body;

    await prismaClient.$transaction(async (tx) => {
        await tx.item.deleteMany({
            where: {
                ownerID: ownerID,
            },
        });
        await tx.list.delete({
            where: {
                ownerID: ownerID,
            },
        });
    });
    return res.status(200).json("list deleted successfully.");
})

export default router;