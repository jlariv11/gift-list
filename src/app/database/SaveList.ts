import axios from "axios";
import {ROUTES} from "@/app/APIRoutes";
import {ListProps} from "@/app/CreateList/page";

export interface Item {
    itemID: number | undefined;
    itemName: string;
    itemQuantity: number;
    itemQuantityPurchased: number | undefined;
    itemLink: string;
    itemImageURL: string;
    itemImageFile: FormData | undefined;
    itemDescription: string;
}

export async function saveList(listProps: ListProps) {
    const data: {ownerID: string, itemIDs: number[]} = (await axios.post(ROUTES.SAVE_LIST, listProps)).data;
    for(let i = 0; i < data.itemIDs.length; i++){
        listProps.items[i].itemID = data.itemIDs[i];
    }

    for (const item of listProps.items) {
        if(item.itemImageFile && item.itemImageFile.has("file") && item.itemID){
            const formData = item.itemImageFile;
            formData.set("itemID", item.itemID.toString());
            formData.set("ownerID", listProps.ownerID);
            formData.set("name", item.itemName);
            await axios.post(ROUTES.SAVE_IMAGES, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
        }
    }

    return data.ownerID;
}

export async function saveSharedList(listProps: ListProps) {
    await axios.post(ROUTES.SAVE_LIST, listProps);
}

export async function deleteItems(itemIDs: number[]) {
    await axios.delete(ROUTES.DELETE_ITEMS, {data: {itemIDs}});
}