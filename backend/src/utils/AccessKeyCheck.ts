import prismaClient from "../database/prisma";
import {ApiError} from "./APIResponse";

export async function checkListAccess(accessToken: string | null, ownerID: string | null) {
    if(!ownerID){
        throw new ApiError(400, "ownerID is required.");
    }
    const list = await prismaClient.list.findUnique(
        {
            where: { ownerID },
            select: {
                auth0Sub: true,
                onlyThisAccount: true,
            }
        });
    if(!list){
        throw new ApiError(404, "List not found.");
    }
    if (list.auth0Sub !== null && list.onlyThisAccount && list.auth0Sub !== accessToken) {
        throw new ApiError(
            403,
            "Only the account owner can modify this list."
        );
    }
}