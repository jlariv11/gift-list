import { beforeAll, afterAll } from "vitest";
import prismaClient from "../src/database/prisma";

beforeAll(async () => {
    const result = await prismaClient.$queryRaw<
        { database_name: string }[]
    >`SELECT current_database() AS database_name`;

    if (result[0]?.database_name !== "giftlist_test") {
        throw new Error(
            "Tests must run against the giftlist_test database!"
        );
    }
});

afterAll(async () => {
    await prismaClient.$disconnect();
});