import prismaClient from "../database/prisma";
import {ApiError} from "./APIResponse";

export async function checkListAccess(accessToken: string | null, ownerID: string | null) {
    if(!ownerID){
        throw new ApiError(400, "ownerID is required.");
    }
    const token = await prismaClient.list.findUnique(
        {
            where: { ownerID },
            select: {
                auth0Sub: true,
            }
        });
    if(!token){
        throw new ApiError(404, "List not found.");
    }
    if (token.auth0Sub && token.auth0Sub !== accessToken) {
        throw new ApiError(403, "Unauthorized.");
    }
}