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
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const listName = req.body.listName ?? "Untitled List1";
    const ownerID = req.body.ownerID ?? null;
    try {
        await prismaClient.$transaction(async (tx) => {
            const accessToken = await tx.list.findUnique(
                {
                    where: { ownerID },
                    select: {
                        auth0Sub: true,
                    }
                });
            if (accessToken && accessToken.auth0Sub !== auth0Sub) {
                throw new Error("Unauthorized.");
            }
            const list = await tx.list.update({
                where: {
                    ownerID: ownerID,
                },
                data: {
                    listName: listName,
                }
            });
            return res.status(200).json(list.listName);
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to update list name",
        });
    }
});

router.get("/load", async (req, res) => {
    const ownerID = typeof req.query.ownerID === "string" ? req.query.ownerID : null;
    const shareID = typeof req.query.shareID === "string" ? req.query.shareID : null;
    if (!ownerID && !shareID)
        return res.status(500).json({error: "Owner or Share ID does not exist"});
    try {
        let listData = null
        if(ownerID) {
            listData = await prismaClient.list.findUnique({
                where: {ownerID: ownerID},
                include: {Item: true},
            })
        }else if(shareID) {
            listData = await prismaClient.list.findUnique({
                where: {shareID: shareID},
                include: {Item: true},
            })
        }
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

    if (!ownerID) {
        return res.status(400).json({ error: "ownerID is required." });
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
                throw new Error("List not found.");
            }

            // Reject if the list belongs to a different authenticated user
            if (list.auth0Sub && list.auth0Sub !== auth0Sub) {
                throw new Error("Unauthorized.");
            }

            await tx.item.deleteMany({
                where: {
                    ownerID: ownerID,
                },
            });

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

        return res.status(200).json("List deleted successfully.");

    } catch (error) {
        if (error instanceof Error) {
            if (error.message === "Unauthorized.") {
                return res.status(403).json({ error: error.message });
            }

            if (error.message === "List not found.") {
                return res.status(404).json({ error: error.message });
            }
        }

        return res.status(500).json({ error: "Failed to delete list." });
    }
});

export default router;