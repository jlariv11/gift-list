import {Router} from "express";
import prismaClient from "../database/prisma";
import {nanoid} from "nanoid";
import {requiredAccessToken} from "../middleware/auth0";

const router = Router();

router.get("/userlists", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    try {
        const lists = await prismaClient.list.findMany({
            where: {
                auth0Sub: auth0Sub,
            },
            select: {
                ownerID: true,
                shareID: true,
                listName: true
            }
        });

        return res.status(200).json(lists);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to retrieve user lists",
        });
    }
});

router.get("/usersharelists", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    if(!auth0Sub) {
        return res.status(401).json({error: "Not authorized"});
    }
    try {
        const lists = await prismaClient.sharedList.findMany({
            where: {
                accountSharedTo: auth0Sub,
            },
            select: {
                shareID: true,
                SharedList: {
                    select: {
                        listName: true,
                    }
                }
            }
        });
        const result = lists.map(list => ({
            shareID: list.shareID,
            listName: list.SharedList.listName
        }));

        return res.status(200).json(result);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to retrieve user lists",
        });
    }
});

router.delete("/removesharelist", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { shareID } = req.body;
    if(!auth0Sub) {
        return res.status(401).json({error: "Not authorized"});
    }
    try {
        await prismaClient.sharedList.deleteMany({
            where: {
                accountSharedTo: auth0Sub,
                shareID: shareID
            }
        });

        return res.status(200);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to delete shared list",
        });
    }
});


router.post("/setuserlist", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { ownerID } = req.body;
    try {
        const list = await prismaClient.list.update({
            where: {
                ownerID: ownerID,
            },
            data: {
                auth0Sub: auth0Sub,
            }
        });

        return res.status(200).json(list);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to retrieve user lists",
        });
    }
});

router.post("/setusersharelist", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { shareID } = req.body;
    if (!auth0Sub) {
        return res.status(401).json({error: "No access token provided to link."});
    }
    try {
        const list = await prismaClient.sharedList.create({
            data: {
                accountSharedTo: auth0Sub,
                shareID: shareID
            }
        });

        return res.status(200).json(list);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to retrieve user lists",
        });
    }
});


export default router;