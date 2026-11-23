// import {VercelRequest, VercelResponse} from "@vercel/node";
// import prismaClient from "../../database/prisma"
// import {del, list} from "@vercel/blob";
//
// export default async function handler(req: VercelRequest, res: VercelResponse) {
//     const ownerID = req.body.ownerID;
//     try{
//         await prismaClient.item.deleteMany({
//             where: {
//                 ownerID: ownerID
//             }
//         })
//         await prismaClient.list.delete({
//             where: {
//                 ownerID: ownerID
//             }
//         })
//         const files = await list({
//             prefix: `${ownerID}/`,
//         });
//         for (const file of files.blobs) {
//             await del(file.pathname);
//         }
//     } catch(err){
//         console.error(err)
//         res.status(500).send({error: err})
//     }
//     res.status(200).json("Deleted successfully.");
// }