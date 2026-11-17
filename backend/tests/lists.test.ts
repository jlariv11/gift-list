import { describe, it, expect, afterEach } from "vitest";
import request from "supertest";
import app from "../src/app";
import prismaClient from "../src/database/prisma";

describe("List API", () => {
    const createdOwnerIDs: string[] = [];

    afterEach(async () => {
        if (createdOwnerIDs.length === 0) return;

        await prismaClient.list.deleteMany({
            where: {
                ownerID: {
                    in: createdOwnerIDs,
                },
            },
        });

        createdOwnerIDs.length = 0;
    });

    it("should create an anonymous list", async () => {
        const response = await request(app)
            .post("/api/lists")
            .send({
                listName: "Integration Test List",
            });

        // Verify the HTTP response
        expect(response.status).toBe(201);
        expect(typeof response.body).toBe("string");

        const ownerID = response.body as string;
        createdOwnerIDs.push(ownerID);

        // Verify the database record
        const list = await prismaClient.list.findUnique({
            where: { ownerID },
        });

        expect(list).not.toBeNull();
        expect(list?.listName).toBe("Integration Test List");
        expect(list?.auth0Sub).toBeNull();
    });

    it("should update an anonymous list's name", async () => {
        // Create a list
        const createResponse = await request(app)
            .post("/api/lists")
            .send({
                listName: "Original Name",
            });

        expect(createResponse.status).toBe(201);

        const ownerID = createResponse.body as string;
        createdOwnerIDs.push(ownerID);

        // Update its name
        const updateResponse = await request(app)
            .post("/api/lists/updateName")
            .send({
                ownerID,
                listName: "Updated Name",
            });

        // Verify the HTTP response
        expect(updateResponse.status).toBe(200);
        expect(updateResponse.body).toBe("Updated Name");

        // Verify the change was saved to PostgreSQL
        const updatedList = await prismaClient.list.findUnique({
            where: { ownerID },
        });

        expect(updatedList).not.toBeNull();
        expect(updatedList?.listName).toBe("Updated Name");
    });

    it("should reject updates to nonexistent lists", async () => {
        const response = await request(app)
            .post("/api/lists/updateName")
            .send({
                ownerID: "nonexistent-owner-id",
                listName: "Updated Name",
            });

        expect(response.status).toBe(404);
    });

});