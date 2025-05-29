import {put} from "@vercel/blob"
import {VercelRequest, VercelResponse} from "@vercel/node";
import formidable, {File} from 'formidable'
import * as fs from "node:fs";
import prismaClient from "../../../lib/prisma"

export const config = {
    api: {
        bodyParser: false
    }
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const form = formidable({multiples: true, keepExtensions: true});
    await form.parse(req, async (err, fields, files) => {
        if (err) {
            console.error('Form parse error:', err);
            res.status(500).json({error: 'Error parsing form data'});
            return;
        }

        // Access fields and files here
        const file = (files['file'][0]) as File;
        const fileStream = fs.createReadStream(file.filepath);
        const {url} = await put(`${fields.ownerID}/${file.newFilename}`, fileStream, {access: 'public', allowOverwrite: true});
        await prismaClient.item.update({
            where: {itemID: Number(fields.itemID)},
            data: {
                itemImageURL: url
            }
        })
    });

    res.status(200).json({});
}

