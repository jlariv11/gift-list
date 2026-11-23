
import { afterEach, describe, expect, it } from "vitest";
import request from "supertest";
import app from "../src/app";
import prismaClient from "../src/database/prisma";

describe("Item API", () => {
    const createdOwnerIDs: string[] = [];

    const makeItem = (overrides = {}) => ({
        itemName: "Test Item",
        itemQuantity: 3,
        itemLink: "",
        itemImageURL: null,
        itemDescription: "Test description",
        ...overrides,
    });

    async function createList() {
        const response = await request(app)
            .post("/api/lists")
            .send({ listName: "Item Test List" });

        expect(response.status).toBe(201);

        const ownerID = response.body.ownerID as string;
        createdOwnerIDs.push(ownerID);

        return ownerID;
    }

    async function createShareID(ownerID: string) {
        const response = await request(app)
            .post("/api/lists/createShareID")
            .send({ ownerID });

        expect(response.status).toBe(200);
        expect(typeof response.body.shareID).toBe("string");

        return response.body.shareID as string;
    }

    async function saveItems(ownerID: string, items: object[]) {
        return request(app)
            .post("/api/items/save")
            .send({ ownerID, items });
    }

    async function createItem(ownerID: string, overrides = {}) {
        const response = await saveItems(ownerID, [
            makeItem(overrides),
        ]);

        expect(response.status).toBe(200);
        expect(response.body.itemIDs).toHaveLength(1);

        return response.body.itemIDs[0] as number;
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

    describe("POST /api/items/save", () => {
        it("creates a new item", async () => {
            const ownerID = await createList();

            const response = await saveItems(ownerID, [
                makeItem(),
            ]);

            expect(response.status).toBe(200);
            expect(response.body.itemIDs).toHaveLength(1);

            const item = await prismaClient.item.findUnique({
                where: {
                    itemID: response.body.itemIDs[0],
                },
            });

            expect(item).not.toBeNull();
            expect(item?.ownerID).toBe(ownerID);
            expect(item?.itemName).toBe("Test Item");
            expect(item?.itemQuantity).toBe(3);
            expect(item?.itemDescription).toBe("Test description");
        });

        it("creates multiple items and returns IDs in order", async () => {
            const ownerID = await createList();

            const response = await saveItems(ownerID, [
                makeItem({ itemName: "First" }),
                makeItem({ itemName: "Second" }),
                makeItem({ itemName: "Third" }),
            ]);

            expect(response.status).toBe(200);
            expect(response.body.itemIDs).toHaveLength(3);
            expect(new Set(response.body.itemIDs).size).toBe(3);

            for (let i = 0; i < 3; i++) {
                const item = await prismaClient.item.findUnique({
                    where: { itemID: response.body.itemIDs[i] },
                });

                expect(item?.itemName).toBe(
                    ["First", "Second", "Third"][i]
                );
            }
        });

        it("updates an existing item", async () => {
            const ownerID = await createList();
            const itemID = await createItem(ownerID);

            const response = await saveItems(ownerID, [
                makeItem({
                    itemID,
                    itemName: "Updated Item",
                    itemQuantity: 5,
                    itemDescription: "Updated description",
                }),
            ]);

            expect(response.status).toBe(200);
            expect(response.body.itemIDs).toEqual([itemID]);

            const item = await prismaClient.item.findUnique({
                where: { itemID },
            });

            expect(item?.itemName).toBe("Updated Item");
            expect(item?.itemQuantity).toBe(5);
            expect(item?.itemDescription).toBe("Updated description");
        });

        it("creates and updates items in the same request", async () => {
            const ownerID = await createList();
            const existingID = await createItem(ownerID);

            const response = await saveItems(ownerID, [
                makeItem({
                    itemID: existingID,
                    itemName: "Modified",
                }),
                makeItem({
                    itemName: "New Item",
                }),
            ]);

            expect(response.status).toBe(200);
            expect(response.body.itemIDs).toHaveLength(2);
            expect(response.body.itemIDs[0]).toBe(existingID);
            expect(response.body.itemIDs[1]).not.toBe(existingID);

            const items = await prismaClient.item.findMany({
                where: { ownerID },
            });

            expect(items).toHaveLength(2);
        });

        it("does not delete items omitted from the request", async () => {
            const ownerID = await createList();

            const firstID = await createItem(ownerID, {
                itemName: "First",
            });

            const secondID = await createItem(ownerID, {
                itemName: "Second",
            });

            const response = await saveItems(ownerID, [
                makeItem({
                    itemID: firstID,
                    itemName: "Updated First",
                }),
            ]);

            expect(response.status).toBe(200);

            const secondItem = await prismaClient.item.findUnique({
                where: { itemID: secondID },
            });

            expect(secondItem?.itemName).toBe("Second");
        });

        it("rejects a missing ownerID", async () => {
            const response = await request(app)
                .post("/api/items/save")
                .send({ items: [makeItem()] });

            expect(response.status).toBe(400);
        });

        it("rejects a nonexistent list", async () => {
            const response = await saveItems(
                "nonexistent-owner-id",
                [makeItem()]
            );

            expect(response.status).toBe(404);
        });

        it("rejects items that are not an array", async () => {
            const ownerID = await createList();

            const response = await request(app)
                .post("/api/items/save")
                .send({
                    ownerID,
                    items: makeItem(),
                });

            expect(response.status).toBe(400);
        });

        it("rejects an item with an empty name", async () => {
            const ownerID = await createList();

            const response = await saveItems(ownerID, [
                makeItem({ itemName: "   " }),
            ]);

            expect(response.status).toBe(400);
        });

        it("rejects invalid item quantities", async () => {
            const ownerID = await createList();

            for (const quantity of [0, -1, 1.5, "3"]) {
                const response = await saveItems(ownerID, [
                    makeItem({ itemQuantity: quantity }),
                ]);

                expect(response.status).toBe(400);
            }
        });

        it("rejects duplicate item IDs", async () => {
            const ownerID = await createList();
            const itemID = await createItem(ownerID);

            const response = await saveItems(ownerID, [
                makeItem({ itemID }),
                makeItem({ itemID }),
            ]);

            expect(response.status).toBe(400);
        });

        it("cannot modify an item belonging to another list", async () => {
            const firstOwnerID = await createList();
            const secondOwnerID = await createList();

            const itemID = await createItem(firstOwnerID, {
                itemName: "Protected Item",
            });

            const response = await saveItems(secondOwnerID, [
                makeItem({
                    itemID,
                    itemName: "Unauthorized Change",
                }),
            ]);

            expect(response.status).toBe(404);

            const item = await prismaClient.item.findUnique({
                where: { itemID },
            });

            expect(item?.itemName).toBe("Protected Item");
        });

        it("rolls back all changes if one item is invalid", async () => {
            const ownerID = await createList();
            const otherOwnerID = await createList();

            const protectedID = await createItem(otherOwnerID);

            const response = await saveItems(ownerID, [
                makeItem({ itemName: "Should Not Exist" }),
                makeItem({
                    itemID: protectedID,
                    itemName: "Unauthorized",
                }),
            ]);

            expect(response.status).toBe(404);

            const items = await prismaClient.item.findMany({
                where: { ownerID },
            });

            expect(items).toHaveLength(0);
        });

        it("ignores extra properties when saving items", async () => {
            const ownerID = await createList();

            const response = await saveItems(ownerID, [
                makeItem({
                    ownerID: "another-owner",
                    itemQuantityPurchased: 99,
                }),
            ]);

            expect(response.status).toBe(200);

            const item = await prismaClient.item.findUnique({
                where: { itemID: response.body.itemIDs[0] },
            });

            expect(item?.ownerID).toBe(ownerID);
            expect(item?.itemQuantityPurchased).not.toBe(99);
        });
    });

    describe("PATCH /api/items/savepurchases", () => {
        it("updates the purchased quantity", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);
            const itemID = await createItem(ownerID);

            const response = await request(app)
                .patch("/api/items/savepurchases")
                .send({
                    shareID,
                    items: [{
                        itemID,
                        itemQuantityPurchased: 2,
                    }],
                });

            expect(response.status).toBe(200);

            const item = await prismaClient.item.findUnique({
                where: { itemID },
            });

            expect(item?.itemQuantityPurchased).toBe(2);
        });

        it("allows a purchased quantity of zero", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);
            const itemID = await createItem(ownerID);

            const response = await request(app)
                .patch("/api/items/savepurchases")
                .send({
                    shareID,
                    items: [{
                        itemID,
                        itemQuantityPurchased: 0,
                    }],
                });

            expect(response.status).toBe(200);

            const item = await prismaClient.item.findUnique({
                where: { itemID },
            });

            expect(item?.itemQuantityPurchased).toBe(0);
        });

        it("rejects quantities greater than requested", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);
            const itemID = await createItem(ownerID, {
                itemQuantity: 2,
            });

            const response = await request(app)
                .patch("/api/items/savepurchases")
                .send({
                    shareID,
                    items: [{
                        itemID,
                        itemQuantityPurchased: 3,
                    }],
                });

            expect(response.status).toBe(409);
        });

        it("rejects negative purchased quantities", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);
            const itemID = await createItem(ownerID);

            const response = await request(app)
                .patch("/api/items/savepurchases")
                .send({
                    shareID,
                    items: [{
                        itemID,
                        itemQuantityPurchased: -1,
                    }],
                });

            expect(response.status).toBe(400);
        });

        it("rejects a missing shareID", async () => {
            const response = await request(app)
                .patch("/api/items/savepurchases")
                .send({
                    items: [{
                        itemID: 1,
                        itemQuantityPurchased: 1,
                    }],
                });

            expect(response.status).toBe(400);
        });

        it("rejects a nonexistent shareID", async () => {
            const response = await request(app)
                .patch("/api/items/savepurchases")
                .send({
                    shareID: "nonexistent-share-id",
                    items: [{
                        itemID: 1,
                        itemQuantityPurchased: 1,
                    }],
                });

            expect(response.status).toBe(404);
        });

        it("cannot modify purchases from another list", async () => {
            const firstOwnerID = await createList();
            const secondOwnerID = await createList();

            const shareID = await createShareID(firstOwnerID);
            const otherItemID = await createItem(secondOwnerID);

            const response = await request(app)
                .patch("/api/items/savepurchases")
                .send({
                    shareID,
                    items: [{
                        itemID: otherItemID,
                        itemQuantityPurchased: 1,
                    }],
                });

            expect(response.status).toBe(409);

            const item = await prismaClient.item.findUnique({
                where: { itemID: otherItemID },
            });

            expect(item?.itemQuantityPurchased ?? 0).toBe(0);
        });

        it("rejects duplicate item IDs", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);
            const itemID = await createItem(ownerID);

            const response = await request(app)
                .patch("/api/items/savepurchases")
                .send({
                    shareID,
                    items: [
                        { itemID, itemQuantityPurchased: 1 },
                        { itemID, itemQuantityPurchased: 2 },
                    ],
                });

            expect(response.status).toBe(400);
        });

        it("rolls back purchases if one update fails", async () => {
            const ownerID = await createList();
            const shareID = await createShareID(ownerID);

            const firstID = await createItem(ownerID);
            const secondID = await createItem(ownerID, {
                itemQuantity: 1,
            });

            const response = await request(app)
                .patch("/api/items/savepurchases")
                .send({
                    shareID,
                    items: [
                        {
                            itemID: firstID,
                            itemQuantityPurchased: 2,
                        },
                        {
                            itemID: secondID,
                            itemQuantityPurchased: 5,
                        },
                    ],
                });

            expect(response.status).toBe(409);

            const firstItem = await prismaClient.item.findUnique({
                where: { itemID: firstID },
            });

            expect(firstItem?.itemQuantityPurchased ?? 0).toBe(0);
        });
    });

    describe("DELETE /api/items/delete", () => {
        it("deletes an item", async () => {
            const ownerID = await createList();
            const itemID = await createItem(ownerID);

            const response = await request(app)
                .delete("/api/items/delete")
                .send({
                    ownerID,
                    itemIDs: [itemID],
                });

            expect(response.status).toBe(204);

            const item = await prismaClient.item.findUnique({
                where: { itemID },
            });

            expect(item).toBeNull();
        });

        it("deletes multiple items", async () => {
            const ownerID = await createList();

            const firstID = await createItem(ownerID);
            const secondID = await createItem(ownerID);

            const response = await request(app)
                .delete("/api/items/delete")
                .send({
                    ownerID,
                    itemIDs: [firstID, secondID],
                });

            expect(response.status).toBe(204);

            const count = await prismaClient.item.count({
                where: { ownerID },
            });

            expect(count).toBe(0);
        });

        it("rejects a missing ownerID", async () => {
            const response = await request(app)
                .delete("/api/items/delete")
                .send({
                    itemIDs: [1],
                });

            expect(response.status).toBe(400);
        });

        it("rejects invalid item IDs", async () => {
            const ownerID = await createList();

            const response = await request(app)
                .delete("/api/items/delete")
                .send({
                    ownerID,
                    itemIDs: ["invalid"],
                });

            expect(response.status).toBe(400);
        });

        it("rejects duplicate item IDs", async () => {
            const ownerID = await createList();
            const itemID = await createItem(ownerID);

            const response = await request(app)
                .delete("/api/items/delete")
                .send({
                    ownerID,
                    itemIDs: [itemID, itemID],
                });

            expect(response.status).toBe(400);
        });

        it("cannot delete an item belonging to another list", async () => {
            const firstOwnerID = await createList();
            const secondOwnerID = await createList();

            const itemID = await createItem(firstOwnerID);

            const response = await request(app)
                .delete("/api/items/delete")
                .send({
                    ownerID: secondOwnerID,
                    itemIDs: [itemID],
                });

            expect(response.status).toBe(404);

            const item = await prismaClient.item.findUnique({
                where: { itemID },
            });

            expect(item).not.toBeNull();
        });

        it("rolls back deletion if one item does not belong to the list", async () => {
            const firstOwnerID = await createList();
            const secondOwnerID = await createList();

            const firstItemID = await createItem(firstOwnerID);
            const secondItemID = await createItem(secondOwnerID);

            const response = await request(app)
                .delete("/api/items/delete")
                .send({
                    ownerID: firstOwnerID,
                    itemIDs: [firstItemID, secondItemID],
                });

            expect(response.status).toBe(404);

            const item = await prismaClient.item.findUnique({
                where: { itemID: firstItemID },
            });

            expect(item).not.toBeNull();
        });

        it("rejects deletion from a nonexistent list", async () => {
            const response = await request(app)
                .delete("/api/items/delete")
                .send({
                    ownerID: "nonexistent-owner-id",
                    itemIDs: [1],
                });

            expect(response.status).toBe(404);
        });
    });
});
