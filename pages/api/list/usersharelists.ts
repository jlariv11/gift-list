import {VercelRequest, VercelResponse} from '@vercel/node'
import prismaClient from "../../../lib/prisma"

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const auth0Owner = req.query.auth0Owner as string;
    try{
        const lists = await prismaClient.sharedList.findMany({
            where: {
                accountSharedTo: auth0Owner,
            },
            include: {
                SharedList: true
            }
        })
        if (lists) {
            const sharedLists = []
            for (const list of lists) {
                sharedLists.push({sharedListName: list.SharedList.listName, accountSharedTo: list.accountSharedTo, id: list.id, shareID: list.shareID})
            }
            res.status(200).json(sharedLists);
        } else {
            res.status(404).json("List not found");
        }
    }catch (err){
        console.error(err);
        res.status(500).json("Failed to get list");
    }
}