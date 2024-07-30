"use server"
import { sql } from "@vercel/postgres";

export async function createList(ids: string[], toDelete: string[], items: {itemName: string, link: string, image: string}[], listName: string): Promise<string> {
    try {
        const { rows } = await sql`SELECT set_unique_code() as code`;
        const code = String(rows[0].code);
        await sql`INSERT INTO LIST VALUES (${code}, null, ${listName})`;
        saveList(code, listName, ids, toDelete, items);
        return code;
      } catch (error) {
        console.error('Error executing stored procedure:', error);
        return "";
      }
}

export async function generateShareCode(ownerid: string): Promise<string>{
    try{
        const x = await sql`SELECT shareid FROM LIST WHERE ownerid=${ownerid}`;
        if(x.rows[0].shareid == null){
            const rows = await sql`SELECT set_unique_share_code() as shareid`
            const shareid = String(rows.rows[0].shareid);
            await sql`UPDATE LIST SET shareid=${shareid} WHERE ownerid=${ownerid}`;
            return shareid;
        }else{
            return String(x.rows[0].shareid);
        }
    }catch (error){
        console.error('Error executing stored procedure:', error);
        return "";
    }
}

export async function saveList(code: string, listName: string, ids: string[], toDelete: string[], items: {itemName: string, link: string, image: string}[]): Promise<void> {
    try {
        toDelete.map(async id =>{
            await sql`DELETE FROM ENTRY WHERE id=${id} AND ownerid=${code}`;
        });
        ids.map(async id => {
            var itemData = items[ids.indexOf(id)];
            await sql`INSERT INTO ENTRY VALUES(${code}, ${itemData.itemName}, ${itemData.link}, ${itemData.image}, 1, ${id})`;
        });
        await sql`UPDATE LIST SET NAME=${listName} WHERE ownerid=${code}`;
    } catch (error) {
        console.error('Error executing stored procedure:', error);
    }
}

export interface ListData {
    listName: string,
    itemNames: string[],
    itemLinks: string[],
    itemImages: string[],
    itemQuantities: number[],
    itemIDs: string[]
}

export async function loadList(code: string): Promise<ListData> {
    try{
        const listName = await sql`SELECT name FROM LIST WHERE ownerid=${code} OR shareid=${code}`;
        const listEntries = await sql`SELECT name, link, image, quantity, id FROM ENTRY WHERE ownerid=${code} OR ownerid=(SELECT ownerid FROM LIST WHERE shareid=${code})`;
        var dataOut = {listName: "", itemNames: [], itemLinks: [], itemImages: [], itemQuantities: [], itemIDs: []};
        dataOut.listName = listName.rows[0].name;
        listEntries.rows.forEach(entry => {
            dataOut.itemNames = dataOut.itemNames.concat(entry.name);
            dataOut.itemLinks = dataOut.itemLinks.concat(entry.link);
            dataOut.itemImages = dataOut.itemImages.concat(entry.image);
            dataOut.itemQuantities = dataOut.itemQuantities.concat(entry.quantity);
            dataOut.itemIDs = dataOut.itemIDs.concat(entry.id);
        });
        return dataOut;
    }catch(error){
        console.error('Error executing stored procedure:', error);
    }
    return {listName: "", itemNames: [], itemLinks: [], itemImages: [], itemQuantities: [], itemIDs: []};
}