
import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import prismaClient from "../src/database/prisma";

describe("List API", () => {
    const createdOwnerIDs: string[] = [];

    async function createList(listName?: string) {
        const response = await request(app)
            .post("/api/lists")
            .send(listName === undefined ? {} : { listName });

        expect(response.status).toBe(201);

        const ownerID = response.body.ownerID as string;
        createdOwnerIDs.push(ownerID);

        return ownerID;
    }

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

    describe("POST /api/lists", () => {
        it("creates an anonymous list", async () => {
            const ownerID = await createList("Test List");

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list).not.toBeNull();
            expect(list?.listName).toBe("Test List");
            expect(list?.auth0Sub).toBeNull();
            expect(list?.shareID).toBeNull();
        });

        it("creates a list with the default name", async () => {
            const ownerID = await createList();

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list?.listName).toBe("Untitled List");
        });

        it("generates unique owner IDs", async () => {
            const first = await createList();
            const second = await createList();

            expect(first).not.toBe(second);
        });
    });

    describe("PATCH /api/lists/:ownerID", () => {
        it("updates an anonymous list name", async () => {
            const ownerID = await createList("Original Name");

            const response = await request(app)
                .patch(`/api/lists/${ownerID}`)
                .send({ listName: "Updated Name" });

            expect(response.status).toBe(200);
            expect(response.body).toEqual({
                listName: "Updated Name",
            });

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list?.listName).toBe("Updated Name");
        });

        it("rejects a missing list name", async () => {
            const ownerID = await createList("Original Name");

            const response = await request(app)
                .patch(`/api/lists/${ownerID}`)
                .send({});

            expect(response.status).toBe(400);

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list?.listName).toBe("Original Name");
        });

        it("returns 404 for a nonexistent list", async () => {
            const response = await request(app)
                .patch("/api/lists/nonexistent-owner-id")
                .send({ listName: "Updated Name" });

            expect(response.status).toBe(404);
        });
    });

    describe("GET /api/lists/load", () => {
        it("loads a list using its owner ID", async () => {
            const ownerID = await createList("Test List");

            const response = await request(app)
                .get("/api/lists/load")
                .query({ ownerID });

            expect(response.status).toBe(200);
            expect(response.body.ownerID).toBe(ownerID);
            expect(response.body.listName).toBe("Test List");
            expect(response.body.Item).toEqual([]);
        });

        it("returns 404 for a nonexistent owner ID", async () => {
            const response = await request(app)
                .get("/api/lists/load")
                .query({ ownerID: "nonexistent-owner-id" });

            expect(response.status).toBe(404);
        });

        it("returns 400 when no ID is provided", async () => {
            const response = await request(app)
                .get("/api/lists/load");

            expect(response.status).toBe(400);
        });
    });

    describe("POST /api/lists/createShareID", () => {
        it("generates a share ID", async () => {
            const ownerID = await createList();

            const response = await request(app)
                .post("/api/lists/createShareID")
                .send({ownerID} );

            expect(response.status).toBe(200);
            expect(typeof response.body.shareID).toBe("string");
            expect(response.body.shareID.length).toBeGreaterThan(0);

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list?.shareID).toBe(response.body.shareID);
        });

        it("returns the existing share ID", async () => {
            const ownerID = await createList();

            const firstResponse = await request(app)
                .post("/api/lists/createShareID")
                .send({ownerID});

            expect(firstResponse.status).toBe(200);

            const secondResponse = await request(app)
                .post("/api/lists/createShareID")
                .send({ownerID} );

            expect(secondResponse.status).toBe(200);
            expect(secondResponse.body).toEqual(firstResponse.body);
        });

        it("returns 404 for a nonexistent list", async () => {
            const response = await request(app)
                .post("/api/lists/createShareID")
                .send({ ownerID: "nonexistent-owner-id" });

            expect(response.status).toBe(404);
        });

        it("returns 400 when ownerID is missing", async () => {
            const response = await request(app)
                .post("/api/lists/createShareID")
                .send({ownerID: null});

            expect(response.status).toBe(400);
        });
    });

    describe("GET /api/lists/load by shareID", () => {
        it("loads a list using its share ID", async () => {
            const ownerID = await createList("Shared List");

            const shareResponse = await request(app)
                .post("/api/lists/createShareID")
                .send({ ownerID });

            expect(shareResponse.status).toBe(200);

            const response = await request(app)
                .get("/api/lists/load")
                .query({ shareID: shareResponse.body.shareID });

            expect(response.status).toBe(200);
            expect(response.body.listName).toBe("Shared List");
            expect(response.body.shareID).toBe(shareResponse.body.shareID);

            expect(response.body).not.toHaveProperty("ownerID");
            expect(response.body).not.toHaveProperty("auth0Sub");
            expect(response.body.Item).toEqual([]);
        });

        it("returns 404 for an invalid share ID", async () => {
            const response = await request(app)
                .get("/api/lists/load")
                .query({ shareID: "invalid-share-id" });

            expect(response.status).toBe(404);
        });
    });

    describe("GET /api/lists/shareid", () => {
        it("retrieves an existing share ID", async () => {
            const ownerID = await createList();

            const createResponse = await request(app)
                .post("/api/lists/createShareID")
                .send({ ownerID });

            expect(createResponse.status).toBe(200);

            const response = await request(app)
                .get("/api/lists/shareid")
                .query({ ownerID });

            expect(response.status).toBe(200);
            expect(response.body).toEqual(createResponse.body);
        });

        it("returns null when a list has no share ID", async () => {
            const ownerID = await createList();

            const response = await request(app)
                .get("/api/lists/shareid")
                .query({ ownerID });

            expect(response.status).toBe(200);
            expect(response.body.shareID).toBeNull();
        });

        it("returns 404 for a nonexistent list", async () => {
            const response = await request(app)
                .get("/api/lists/shareid")
                .query({ ownerID: "nonexistent-owner-id" });

            expect(response.status).toBe(404);
        });
    });

    describe("DELETE /api/lists/delete", () => {
        it("deletes an anonymous list", async () => {
            const ownerID = await createList();

            const response = await request(app)
                .delete("/api/lists/delete")
                .send({ ownerID });

            expect(response.status).toBe(204);

            const list = await prismaClient.list.findUnique({
                where: { ownerID },
            });

            expect(list).toBeNull();
        });

        it("returns 404 for a nonexistent list", async () => {
            const response = await request(app)
                .delete("/api/lists/delete")
                .send({ ownerID: "nonexistent-owner-id" });

            expect(response.status).toBe(404);
        });

        it("returns 400 when ownerID is missing", async () => {
            const response = await request(app)
                .delete("/api/lists/delete")
                .send({});

            expect(response.status).toBe(400);
        });
    });


    describe("Additional List API validation", () => {

        describe("POST /api/lists", () => {
            it("rejects a numeric list name", async () => {
                const response = await request(app)
                    .post("/api/lists")
                    .send({ listName: 123 });

                expect(response.status).toBe(400);
                expect(response.body.error).toBeDefined();
            });

            it("rejects an empty list name", async () => {
                const response = await request(app)
                    .post("/api/lists")
                    .send({ listName: "   " });

                expect(response.status).toBe(400);
            });

            it("trims whitespace from the list name", async () => {
                const ownerID = await createList("  Birthday List  ");

                const list = await prismaClient.list.findUnique({
                    where: { ownerID },
                });

                expect(list?.listName).toBe("Birthday List");
            });

            it("returns the owner ID as a JSON object", async () => {
                const ownerID = await createList("Test List");

                expect(typeof ownerID).toBe("string");
                expect(ownerID.length).toBeGreaterThan(0);
            });
        });

        describe("PATCH /api/lists/:ownerID", () => {
            it("updates the list name", async () => {
                const ownerID = await createList("Original");

                const response = await request(app)
                    .patch(`/api/lists/${ownerID}`)
                    .send({ listName: "Updated" });

                expect(response.status).toBe(200);
                expect(response.body).toEqual({
                    listName: "Updated",
                });

                const list = await prismaClient.list.findUnique({
                    where: { ownerID },
                });

                expect(list?.listName).toBe("Updated");
            });

            it("rejects a missing list name", async () => {
                const ownerID = await createList();

                const response = await request(app)
                    .patch(`/api/lists/${ownerID}`)
                    .send({});

                expect(response.status).toBe(400);
            });

            it("rejects an empty list name", async () => {
                const ownerID = await createList();

                const response = await request(app)
                    .patch(`/api/lists/${ownerID}`)
                    .send({ listName: "   " });

                expect(response.status).toBe(400);
            });

            it("rejects a numeric list name", async () => {
                const ownerID = await createList();

                const response = await request(app)
                    .patch(`/api/lists/${ownerID}`)
                    .send({ listName: 123 });

                expect(response.status).toBe(400);
            });

            it("returns 404 for a nonexistent list", async () => {
                const response = await request(app)
                    .patch("/api/lists/nonexistent-owner-id")
                    .send({ listName: "Updated" });

                expect(response.status).toBe(404);
            });

            it("does not allow modifying protected fields", async () => {
                const ownerID = await createList("Original");

                const response = await request(app)
                    .patch(`/api/lists/${ownerID}`)
                    .send({
                        listName: "Updated",
                        auth0Sub: "attacker-account",
                        shareID: "malicious-share-id",
                        onlyThisAccount: true,
                    });

                expect(response.status).toBe(200);

                const list = await prismaClient.list.findUnique({
                    where: { ownerID },
                });

                expect(list?.listName).toBe("Updated");
                expect(list?.auth0Sub).toBeNull();
                expect(list?.shareID).toBeNull();
                expect(list?.onlyThisAccount).toBe(false);
            });

            it("preserves the original name after invalid input", async () => {
                const ownerID = await createList("Original");

                const response = await request(app)
                    .patch(`/api/lists/${ownerID}`)
                    .send({ listName: null });

                expect(response.status).toBe(400);

                const list = await prismaClient.list.findUnique({
                    where: { ownerID },
                });

                expect(list?.listName).toBe("Original");
            });
        });

        describe("GET /api/lists/load", () => {
            it("does not expose ownerID through a share link", async () => {
                const ownerID = await createList("Public List");

                const shareResponse = await request(app)
                    .post("/api/lists/createShareID")
                    .send({ ownerID });

                expect(shareResponse.status).toBe(200);

                const response = await request(app)
                    .get("/api/lists/load")
                    .query({
                        shareID: shareResponse.body.shareID,
                    });

                expect(response.status).toBe(200);
                expect(response.body.listName).toBe("Public List");

                expect(response.body).not.toHaveProperty("ownerID");
                expect(response.body).not.toHaveProperty("auth0Sub");
                expect(response.body).not.toHaveProperty("onlyThisAccount");
            });

            it("returns the owner ID when loading by ownerID", async () => {
                const ownerID = await createList();

                const response = await request(app)
                    .get("/api/lists/load")
                    .query({ ownerID });

                expect(response.status).toBe(200);
                expect(response.body.ownerID).toBe(ownerID);
                expect(response.body).not.toHaveProperty("auth0Sub");
            });

            it("returns 404 for an invalid share ID", async () => {
                const response = await request(app)
                    .get("/api/lists/load")
                    .query({ shareID: "invalid-share-id" });

                expect(response.status).toBe(404);
            });

            it("returns 400 when no ID is provided", async () => {
                const response = await request(app)
                    .get("/api/lists/load");

                expect(response.status).toBe(400);
            });
        });

        describe("GET /api/lists/shareid", () => {
            it("returns null when a share ID has not been generated", async () => {
                const ownerID = await createList();

                const response = await request(app)
                    .get("/api/lists/shareid")
                    .query({ ownerID });

                expect(response.status).toBe(200);
                expect(response.body).toEqual({
                    shareID: null,
                });
            });

            it("returns 400 when ownerID is missing", async () => {
                const response = await request(app)
                    .get("/api/lists/shareid");

                expect(response.status).toBe(400);
            });

            it("returns 404 for a nonexistent list", async () => {
                const response = await request(app)
                    .get("/api/lists/shareid")
                    .query({ ownerID: "nonexistent-owner-id" });

                expect(response.status).toBe(404);
            });
        });

        describe("POST /api/lists/createShareID", () => {
            it("returns an object containing shareID", async () => {
                const ownerID = await createList();

                const response = await request(app)
                    .post("/api/lists/createShareID")
                    .send({ ownerID });

                expect(response.status).toBe(200);
                expect(typeof response.body.shareID).toBe("string");
                expect(response.body.shareID.length).toBeGreaterThan(0);
            });

            it("does not replace an existing share ID", async () => {
                const ownerID = await createList();

                const first = await request(app)
                    .post("/api/lists/createShareID")
                    .send({ ownerID });

                const second = await request(app)
                    .post("/api/lists/createShareID")
                    .send({ ownerID });

                expect(first.status).toBe(200);
                expect(second.status).toBe(200);

                expect(second.body.shareID).toBe(first.body.shareID);

                const list = await prismaClient.list.findUnique({
                    where: { ownerID },
                });

                expect(list?.shareID).toBe(first.body.shareID);
            });

            it("returns 400 when ownerID is missing", async () => {
                const response = await request(app)
                    .post("/api/lists/createShareID")
                    .send({});

                expect(response.status).toBe(400);
            });
        });

        describe("DELETE /api/lists/delete", () => {
            it("returns 204 with an empty body", async () => {
                const ownerID = await createList();

                const response = await request(app)
                    .delete("/api/lists/delete")
                    .send({ ownerID });

                expect(response.status).toBe(204);
                expect(response.text).toBe("");

                const list = await prismaClient.list.findUnique({
                    where: { ownerID },
                });

                expect(list).toBeNull();
            });

            it("returns 400 for an invalid ownerID type", async () => {
                const response = await request(app)
                    .delete("/api/lists/delete")
                    .send({ ownerID: 123 });

                expect(response.status).toBe(400);
            });

            it("returns 404 for a nonexistent list", async () => {
                const response = await request(app)
                    .delete("/api/lists/delete")
                    .send({ ownerID: "nonexistent-owner-id" });

                expect(response.status).toBe(404);
            });
        });
    });
});
