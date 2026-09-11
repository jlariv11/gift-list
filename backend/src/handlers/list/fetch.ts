// import {VercelRequest, VercelResponse} from '@vercel/node'
// import prismaClient from "../../database/prisma"
//
// export default async function handler(req: VercelRequest, res: VercelResponse) {
//     const ownerID = typeof req.query.ownerID === "string" ? req.query.ownerID : null;
//     const shareID = typeof req.query.shareID === "string" ? req.query.shareID : null;
//     try{
//         let list = null;
//
//         if (ownerID) {
//             list = await prismaClient.list.findUnique({
//                 where: {
//                     ownerID: ownerID
//                 },
//                 include: { Item: true },
//             });
//         } else if (shareID) {
//             list = await prismaClient.list.findUnique({
//                 where: {
//                     shareID: shareID
//                 },
//                 include: { Item: true },
//             });
//         }
//
//         if (list) {
//             res.status(200).json(list);
//         } else {
//             res.status(404).json("List not found");
//         }
//     }catch (err){
//         console.error(err);
//         res.status(500).json("Failed to get list");
//     }
// }