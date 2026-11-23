// import {VercelRequest, VercelResponse} from '@vercel/node'
// import prismaClient from "../../database/prisma"
//
// export default async function handler(req: VercelRequest, res: VercelResponse) {
//     try{
//         const list = await prismaClient.list.findFirst({
//             where: {
//                 shareID: req.body.data.shareID,
//             },
//             select: {
//                 auth0Owner: true
//             }
//         })
//         if(list && list.auth0Owner === req.body.data.shareVisitor){
//             res.status(200).json("Visitor is Owner")
//             return;
//         }
//         const data = await prismaClient.sharedList.upsert({
//             where: {
//                 accountSharedTo_shareID: {
//                     accountSharedTo: req.body.data.shareVisitor,
//                     shareID: req.body.data.shareID,
//                 },
//             },
//             create: {
//                 accountSharedTo: req.body.data.shareVisitor,
//                 shareID: req.body.data.shareID,
//             },
//             update: {},
//         });
//         if (data) {
//             res.status(200).json(data);
//         } else {
//             res.status(404).json("List not found. Make sure someone else is not already the owner of this list.");
//         }
//     }catch (err){
//         console.error(err);
//         res.status(500).json("Failed to get list");
//     }
// }