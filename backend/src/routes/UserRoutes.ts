
import { Router } from "express";
import prismaClient from "../database/prisma";
import { requiredAccessToken } from "../middleware/auth0";
import { ApiError, handleApiError } from "../utils/APIResponse";

const router = Router();

// Get lists owned by the authenticated user
router.get("/userlists", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;

    if (typeof auth0Sub !== "string" || !auth0Sub) {
        return res.status(401).json({
            error: "Authentication required.",
        });
    }

    try {
        const lists = await prismaClient.list.findMany({
            where: { auth0Sub },
            select: {
                ownerID: true,
                shareID: true,
                listName: true,
            },
        });

        return res.status(200).json(lists);
    } catch (error) {
        return handleApiError(res, error);
    }
});

// Get shared lists saved by the authenticated user
router.get("/usersharelists", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;

    if (typeof auth0Sub !== "string" || !auth0Sub) {
        return res.status(401).json({
            error: "Authentication required.",
        });
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
                    },
                },
            },
        });

        const result = lists.map(list => ({
            shareID: list.shareID,
            listName: list.SharedList.listName,
        }));

        return res.status(200).json(result);
    } catch (error) {
        return handleApiError(res, error);
    }
});

// Remove a shared list from the user's account
router.delete("/removesharelist", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { shareID } = req.body ?? {};

    if (typeof auth0Sub !== "string" || !auth0Sub) {
        return res.status(401).json({
            error: "Authentication required.",
        });
    }

    if (typeof shareID !== "string" || !shareID.trim()) {
        return res.status(400).json({
            error: "A valid shareID is required.",
        });
    }

    try {
        const result = await prismaClient.sharedList.deleteMany({
            where: {
                accountSharedTo: auth0Sub,
                shareID,
            },
        });

        if (result.count === 0) {
            throw new ApiError(404, "Shared list connection not found.");
        }

        return res.status(204).send();
    } catch (error) {
        return handleApiError(res, error);
    }
});

// Associate an anonymous list with the authenticated account
router.post("/setuserlist", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { ownerID } = req.body ?? {};

    if (typeof auth0Sub !== "string" || !auth0Sub) {
        return res.status(401).json({
            error: "Authentication required.",
        });
    }

    if (typeof ownerID !== "string" || !ownerID.trim()) {
        return res.status(400).json({
            error: "A valid ownerID is required.",
        });
    }

    try {
        // Only claim lists that have no account owner.
        // The conditional update prevents simultaneous claims
        // from overwriting one another.
        const updated = await prismaClient.list.updateMany({
            where: {
                ownerID,
                auth0Sub: null,
            },
            data: {
                auth0Sub,
            },
        });

        const list = await prismaClient.list.findUnique({
            where: { ownerID },
            select: {
                ownerID: true,
                shareID: true,
                listName: true,
                auth0Sub: true,
            },
        });

        if (!list) {
            throw new ApiError(404, "List not found.");
        }

        if (list.auth0Sub !== auth0Sub) {
            throw new ApiError(403, "This list belongs to another account.");
        }

        // Return only the fields needed by the frontend.
        return res.status(200).json({
            ownerID: list.ownerID,
            shareID: list.shareID,
            listName: list.listName,
        });
    } catch (error) {
        return handleApiError(res, error);
    }
});

// Save a shared list to the authenticated user's account

router.post("/setusersharelist", requiredAccessToken, async (req, res) => {
    const auth0Sub = req.auth?.payload?.sub ?? null;
    const { shareID } = req.body ?? {};

    if (typeof auth0Sub !== "string" || !auth0Sub) {
        return res.status(401).json({
            error: "Authentication required.",
        });
    }

    if (typeof shareID !== "string" || !shareID.trim()) {
        return res.status(400).json({
            error: "A valid shareID is required.",
        });
    }

    try {
        const list = await prismaClient.list.findUnique({
            where: { shareID },
            select: { auth0Sub: true },
        });

        if (!list) {
            throw new ApiError(404, "Shared list not found.");
        }

        if (list.auth0Sub === auth0Sub) {
            throw new ApiError(
                403,
                "You cannot add your own list as a shared list."
            );
        }

        const existingConnection = await prismaClient.sharedList.findFirst({
            where: {
                accountSharedTo: auth0Sub,
                shareID,
            },
        });

        if (existingConnection) {
            return res.status(200).json({
                message: "User already connected to list.",
            });
        }

        try {
            await prismaClient.sharedList.create({
                data: {
                    accountSharedTo: auth0Sub,
                    shareID,
                },
            });
        } catch (error) {
            if (
                typeof error === "object" &&
                error !== null &&
                "code" in error &&
                error.code === "P2002"
            ) {
                return res.status(200).json({
                    message: "User already connected to list.",
                });
            }

            throw error;
        }

        return res.status(201).json({
            shareID,
            message: "Shared list added successfully.",
        });
    } catch (error) {
        return handleApiError(res, error);
    }
});


export default router;
