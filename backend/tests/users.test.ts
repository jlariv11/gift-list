
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import request from "supertest";
import type { RequestHandler } from "express";
import type { AuthResult } from "express-oauth2-jwt-bearer";

// Mock authentication BEFORE importing the Express app.
vi.mock("../src/middleware/auth0", () => ({
    requiredAccessToken: ((req, res, next) => {
        const authorization = req.headers.authorization;

        if (!authorization?.startsWith("Bearer ")) {
            return res.status(401).json({
                error: "Authentication required.",
            });
        }

        const userID = authorization.slice(7);

        if (!["user-one", "user-two"].includes(userID)) {
            return res.status(401).json({
                error: "Invalid token.",
            });
        }

        req.auth = {
            payload: {
                sub: userID,
            },
            token: authorization.slice(7),
            header: {},
        } as AuthResult;

        next();
    }) satisfies RequestHandler,

    optionalAccessToken: ((req, res, next) => {
        const authorization = req.headers.authorization;

        if (authorization?.startsWith("Bearer ")) {
            const userID = authorization.slice(7);

            if (!["user-one", "user-two"].includes(userID)) {
                return res.status(401).json({
                    error: "Invalid token.",
                });
            }

            req.auth = {
                payload: { sub: userID },
                token: userID,
                header: {},
            } as AuthResult;
        }

        next();
    }) satisfies RequestHandler,
}));

import app from "../src/app";
import prismaClient from "../src/database/prisma";

describe("User API", () => {
    const USER_ONE = "user-one";
    const USER_TWO = "user-two";

    const createdOwnerIDs: string[] = [];

    function authenticated(userID: string = USER_ONE) {
        return {
            Authorization: `Bearer ${userID}`,
        };
    }

    async function createList(
        listName = "Test List",
        auth0Sub: string | null = null
    ) {
        const response = await request(app)
            .post("/api/lists")
            .send({ listName });

        expect(response.status).toBe(201);

        const ownerID = response.body.ownerID as string;
        createdOwnerIDs.push(ownerID);

        if (auth0Sub !== null) {
            await prismaClient.list.update({
                where: { ownerID },
                data: { auth0Sub },
            });
        }

        return ownerID;
    }

    async function createShareID(ownerID: string, userID?: string) {
        const req = request(app)
            .post("/api/lists/createShareID");

        if (userID) {
            req.set(authenticated(userID));
        }

        const response = await req.send({ ownerID });

        expect(response.status).toBe(200);

        return response.body.shareID as string;
    }

    async function addSharedList(shareID: string, userID = USER_ONE) {
        const response = await request(app)
            .post("/api/user/setusersharelist")
            .set(authenticated(userID))
            .send({ shareID })
            .timeout({
                response: 2000,
                deadline: 4000,
            });


        return response;
    }

    beforeEach(() => {
        createdOwnerIDs.length = 0;
    });

    afterEach(async () => {
        if (createdOwnerIDs.length === 0) return;

        await prismaClient.$transaction(async (tx) => {
            const lists = await tx.list.findMany({
                where: {
                    ownerID: { in: createdOwnerIDs },
                },
                select: { shareID: true },
            });

            const shareIDs = lists
                .map(list => list.shareID)
                .filter((id): id is string => id !== null);

            await tx.item.deleteMany({
                where: {
                    ownerID: { in: createdOwnerIDs },
                },
            });

            if (shareIDs.length > 0) {
                await tx.sharedList.deleteMany({
                    where: {
                        shareID: { in: shareIDs },
                    },
                });
            }

            await tx.list.deleteMany({
                where: {
                    ownerID: { in: createdOwnerIDs },
                },
            });
        });

        createdOwnerIDs.length = 0;
    });

    describe("GET /api/user/userlists", () => {
        it("returns lists owned by the authenticated user", async () => {
            const firstID = await createList("First List", USER_ONE);
            const secondID = await createList("Second List", USER_ONE);

            await createList("Other User List", USER_TWO);

            const response = await request(app)
                .get("/api/user/userlists")
                .set(authenticated());

            expect(response.status).toBe(200);
            expect(Array.isArray(response.body)).toBe(true);

            const ownerIDs = response.body.map(
                (list: { ownerID: string }) => list.ownerID
            );

            expect(ownerIDs).toContain(firstID);
            expect(ownerIDs).toContain(secondID);
            expect(response.body.every(
                (list: { ownerID: string }) =>
                    [firstID, secondID].includes(list.ownerID)
            )).toBe(true);
        });

        it("does not return anonymous lists", async () => {
            const ownerID = await createList();

            const response = await request(app)
                .get("/api/user/userlists")
                .set(authenticated());

            expect(response.status).toBe(200);
            expect(response.body.some(
                (list: { ownerID: string }) =>
                    list.ownerID === ownerID
            )).toBe(false);
        });

        it("does not expose auth0Sub", async () => {
            const ownerID = await createList("Private List", USER_ONE);

            const response = await request(app)
                .get("/api/user/userlists")
                .set(authenticated());

            expect(response.status).toBe(200);

            const list = response.body.find(
                (list: { ownerID: string }) =>
                    list.ownerID === ownerID
            );

            expect(list).toBeDefined();
            expect(list).not.toHaveProperty("auth0Sub");
        });

        it("rejects unauthenticated requests", async () => {
            const response = await request(app)
                .get("/api/user/userlists");

            expect(response.status).toBe(401);
        });
    });

    describe("GET /api/user/usersharelists", () => {
        it("returns shared lists saved by the user", async () => {
            const ownerID = await createList("Shared Test List");

            const shareID = await createShareID(ownerID);

            const addResponse = await addSharedList(shareID);

            const response = await request(app)
                .get("/api/user/usersharelists")
                .set(authenticated());

        });

        it("does not return another user's shared connections", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            await addSharedList(shareID, USER_TWO);

            const response = await request(app)
                .get("/api/user/usersharelists")
                .set(authenticated(USER_ONE));

            expect(response.status).toBe(200);
            expect(response.body.some(
                (list: { shareID: string }) =>
                    list.shareID === shareID
            )).toBe(false);
        });

        it("does not expose ownerID", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            await addSharedList(shareID);

            const response = await request(app)
                .get("/api/user/usersharelists")
                .set(authenticated());

            const list = response.body.find(
                (list: { shareID: string }) =>
                    list.shareID === shareID
            );

            expect(list).toBeDefined();
            expect(list).not.toHaveProperty("ownerID");
        });

        it("rejects unauthenticated requests", async () => {
            const response = await request(app)
                .get("/api/user/usersharelists");

            expect(response.status).toBe(401);
        });
    });

    describe("POST /api/user/setuserlist", () => {
        it("allows a user to claim an anonymous list", async () => {
            const ownerID = await createList();

            const response = await request(app)
                .post("/api/user/setuserlist")
                .set(authenticated())
                .send({ ownerID });

            expect(response.status).toBe(200);
            expect(response.body.ownerID).toBe(ownerID);

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list?.auth0Sub).toBe(USER_ONE);
        });

        it("allows claiming an already-owned list", async () => {
            const ownerID = await createList("Owned List", USER_ONE);

            const response = await request(app)
                .post("/api/user/setuserlist")
                .set(authenticated())
                .send({ ownerID });

            expect(response.status).toBe(200);
            expect(response.body.ownerID).toBe(ownerID);
        });

        it("prevents claiming another user's list", async () => {
            const ownerID = await createList("Protected List", USER_ONE);

            const response = await request(app)
                .post("/api/user/setuserlist")
                .set(authenticated(USER_TWO))
                .send({ ownerID });

            expect(response.status).toBe(403);

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list?.auth0Sub).toBe(USER_ONE);
        });

        it("rejects a nonexistent list", async () => {
            const response = await request(app)
                .post("/api/user/setuserlist")
                .set(authenticated())
                .send({ ownerID: "nonexistent-owner-id" });

            expect(response.status).toBe(404);
        });

        it("rejects a missing ownerID", async () => {
            const response = await request(app)
                .post("/api/user/setuserlist")
                .set(authenticated())
                .send({});

            expect(response.status).toBe(400);
        });

        it("rejects an invalid ownerID", async () => {
            const response = await request(app)
                .post("/api/user/setuserlist")
                .set(authenticated())
                .send({ ownerID: 123 });

            expect(response.status).toBe(400);
        });

        it("rejects unauthenticated requests", async () => {
            const ownerID = await createList();

            const response = await request(app)
                .post("/api/user/setuserlist")
                .send({ ownerID });

            expect(response.status).toBe(401);

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list?.auth0Sub).toBeNull();
        });

        it("does not expose auth0Sub in the response", async () => {
            const ownerID = await createList();

            const response = await request(app)
                .post("/api/user/setuserlist")
                .set(authenticated())
                .send({ ownerID });

            expect(response.status).toBe(200);
            expect(response.body).not.toHaveProperty("auth0Sub");
        });
    });

    describe("POST /api/user/setusersharelist", () => {
        it("adds a shared list to the user's account", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            const response = await addSharedList(shareID);

            expect(response.status).toBe(201);
            expect(response.body.shareID).toBe(shareID);

            const connection = await prismaClient.sharedList.findFirst({
                where: {
                    accountSharedTo: USER_ONE,
                    shareID,
                },
            });

            expect(connection).not.toBeNull();
        });

        it("allows sharing a list owned by another user", async () => {
            const ownerID = await createList("Other User List", USER_TWO);
            const shareID = await createShareID(ownerID, USER_TWO);

            const response = await addSharedList(shareID, USER_ONE);

            expect(response.status).toBe(201);
        });

        it("prevents adding your own list as a shared list", async () => {
            const ownerID = await createList("My List", USER_ONE);
            const shareID = await createShareID(ownerID, USER_ONE);

            const response = await addSharedList(shareID, USER_ONE);

            expect(response.status).toBe(403);

            const count = await prismaClient.sharedList.count({
                where: {
                    accountSharedTo: USER_ONE,
                    shareID,
                },
            });

            expect(count).toBe(0);
        });

        it("handles an already-connected shared list", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            const first = await addSharedList(shareID);
            const second = await addSharedList(shareID);

            expect(first.status).toBe(201);
            expect(second.status).toBe(200);

            const count = await prismaClient.sharedList.count({
                where: {
                    accountSharedTo: USER_ONE,
                    shareID,
                },
            });

            expect(count).toBe(1);
        });

        it("rejects a nonexistent shareID", async () => {
            const response = await addSharedList("nonexistent-share-id");

            expect(response.status).toBe(404);
        });

        it("rejects a missing shareID", async () => {
            const response = await request(app)
                .post("/api/user/setusersharelist")
                .set(authenticated())
                .send({});

            expect(response.status).toBe(400);
        });

        it("rejects an invalid shareID", async () => {
            const response = await request(app)
                .post("/api/user/setusersharelist")
                .set(authenticated())
                .send({ shareID: 123 });

            expect(response.status).toBe(400);
        });

        it("rejects unauthenticated requests", async () => {
            const response = await request(app)
                .post("/api/user/setusersharelist")
                .send({ shareID: "some-share-id" });

            expect(response.status).toBe(401);
        });

        it("allows different users to save the same shared list", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            const first = await addSharedList(shareID, USER_ONE);
            const second = await addSharedList(shareID, USER_TWO);

            expect(first.status).toBe(201);
            expect(second.status).toBe(201);

            const count = await prismaClient.sharedList.count({
                where: { shareID },
            });

            expect(count).toBe(2);
        });
    });

    describe("DELETE /api/user/removesharelist", () => {
        it("removes a shared-list connection", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            await addSharedList(shareID);

            const response = await request(app)
                .delete("/api/user/removesharelist")
                .set(authenticated())
                .send({ shareID });

            expect(response.status).toBe(204);

            const connection = await prismaClient.sharedList.findFirst({
                where: {
                    accountSharedTo: USER_ONE,
                    shareID,
                },
            });

            expect(connection).toBeNull();
        });

        it("does not delete the underlying list", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            await addSharedList(shareID);

            const response = await request(app)
                .delete("/api/user/removesharelist")
                .set(authenticated())
                .send({ shareID });

            expect(response.status).toBe(204);

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list).not.toBeNull();
        });

        it("cannot remove another user's shared-list connection", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            await addSharedList(shareID, USER_TWO);

            const response = await request(app)
                .delete("/api/user/removesharelist")
                .set(authenticated(USER_ONE))
                .send({ shareID });

            expect(response.status).toBe(404);

            const connection = await prismaClient.sharedList.findFirst({
                where: {
                    accountSharedTo: USER_TWO,
                    shareID,
                },
            });

            expect(connection).not.toBeNull();
        });

        it("rejects removing a nonexistent connection", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            const response = await request(app)
                .delete("/api/user/removesharelist")
                .set(authenticated())
                .send({ shareID });

            expect(response.status).toBe(404);
        });

        it("rejects a missing shareID", async () => {
            const response = await request(app)
                .delete("/api/user/removesharelist")
                .set(authenticated())
                .send({});

            expect(response.status).toBe(400);
        });

        it("rejects unauthenticated requests", async () => {
            const response = await request(app)
                .delete("/api/user/removesharelist")
                .send({ shareID: "some-share-id" });

            expect(response.status).toBe(401);
        });
    });
});
