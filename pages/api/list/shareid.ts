import {VercelRequest, VercelResponse} from '@vercel/node'
import prismaClient from "../../../lib/prisma"
import {nanoid} from "nanoid";

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const ownerID = req.query.ownerID as string;
    // Handle adding a share ID to a list
    try{
        let shareID = await prismaClient.list.findUnique({
            where: {
                ownerID: ownerID
            },
            select: {
                shareID: true
            }
        })
        if(shareID && !shareID.shareID) {
            shareID = await prismaClient.list.update({
                where: {
                    ownerID: ownerID
                },
                data: {
                    shareID: nanoid()
                },
                select: {
                    shareID: true
                }
            });
        }
        if(shareID && !shareID.shareID) {
            res.status(500).json("Failed to create shareID");
            return;
        }
        res.status(200).json(shareID);
    }catch (err){
        console.error(err);
        res.status(500).json("Failed to create shareID");
    }
}