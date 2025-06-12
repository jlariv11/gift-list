import {VercelRequest, VercelResponse} from '@vercel/node'
import prismaClient from "../../../lib/prisma"

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const auth0Owner = req.query.auth0Owner as string;
    try{
        const lists = await prismaClient.list.findMany({
            where: {
                auth0Owner: auth0Owner,
            },
            select: {
                ownerID: true,
                shareID: true,
                listName: true,
            }
        })
        if (lists) {
            res.status(200).json(lists);
        } else {
            res.status(404).json("List not found");
        }
    }catch (err){
        console.error(err);
        res.status(500).json("Failed to get list");
    }
}