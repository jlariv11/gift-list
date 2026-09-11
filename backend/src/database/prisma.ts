import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const connectionString = process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
    throw new Error("POSTGRES_PRISMA_URL is not set");
}

const adapter = new PrismaPg({
    connectionString,
});

const prismaClient = new PrismaClient({
    adapter,
});

export default prismaClient;