"use server"
import { sql } from "@vercel/postgres";

export async function createList(ids: number[], toDelete: number[], toUpdate: number[], items: {itemName: string, link: string, image: string}[], listName: string): Promise<string> {
    try {
        const { rows } = await sql`SELECT set_unique_code() as code`;
        const code = String(rows[0].code);
        await sql`INSERT INTO LIST VALUES (${code}, null, ${listName})`;
        saveList(code, ids, toDelete, toUpdate, items);
        return code;
      } catch (error) {
        console.error('Error executing stored procedure:', error);
        return "";
      }
}

export async function saveList(code: string, ids: number[], toDelete: number[], toUpdate: number[], items: {itemName: string, link: string, image: string}[]): Promise<void> {
    try {
        ids.map(async id => {
            if(toDelete.includes(id)){
                await sql`DELETE FROM ENTRY WHERE id=${id} AND ownerid=${code}`;
            }else{
                var itemData = items[ids.indexOf(id)];
                await sql`INSERT INTO ENTRY VALUES(${code}, ${itemData.itemName}, ${itemData.link}, ${itemData.image}, 1, ${id})`;
            }
        });
    } catch (error) {
        console.error('Error executing stored procedure:', error);
    }
}