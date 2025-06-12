import {VercelRequest, VercelResponse} from '@vercel/node'
import prismaClient from "../../../lib/prisma"

export default async function handler(req: VercelRequest, res: VercelResponse) {
    try{
        const data = await prismaClient.list.update({
            where: {
                ownerID: req.body.data.ownerID,
                auth0Owner: undefined
            },
            data: {
                auth0Owner: req.body.data.auth0Owner,
            }
        })
        if (data) {
            res.status(200).json(data);
        } else {
            res.status(404).json("List not found. Make sure someone else is not already the owner of this list.");
        }
    }catch (err){
        console.error(err);
        res.status(500).json("Failed to get list");
    }
}