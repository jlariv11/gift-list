import {VercelRequest, VercelResponse} from '@vercel/node'
import prismaClient from "../../../lib/prisma"

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const auth0Owner = req.body.auth0Owner as string;
    const shareID = req.body.shareID as string;
    try{
        const list = await prismaClient.sharedList.delete({
            where: {
                accountSharedTo_shareID: {
                    accountSharedTo: auth0Owner,
                    shareID: shareID,
                }
            }
        })
        if (list) {
            res.status(200);
        } else {
            res.status(404).json("List not found");
        }
    }catch (err){
        console.error(err);
        res.status(500).json("Failed to get list");
    }
}