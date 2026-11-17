import { describe, it, expect } from "vitest";
import prismaClient from "../src/database/prisma";

describe("Database Connection", () => {
    it("should connect to the test database", async () => {
        const result = await prismaClient.$queryRaw<
            { database_name: string }[]
        >`SELECT current_database() AS database_name`;

        expect(result[0].database_name).toBe("giftlist_test");
    });
});