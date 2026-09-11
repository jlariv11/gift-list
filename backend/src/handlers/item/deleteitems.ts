// import {VercelRequest, VercelResponse} from '@vercel/node'
// import prismaClient from "../../database/prisma"
//
// export default async function handler(req: VercelRequest, res: VercelResponse) {
//     const data = req.body;
//     try {
//         for(const itemID of data.itemIDs){
//             await prismaClient.item.delete({
//                 where: {
//                     itemID: itemID
//                 }
//             })
//         }
//         res.status(200).json({});
//     }catch (err){
//         console.error(err);
//         res.status(500).json("Failed to delete items")
//     }
// }