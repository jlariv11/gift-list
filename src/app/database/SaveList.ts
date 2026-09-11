import axios from "axios";
import {ROUTES} from "../APIRoutes";
import {ListProps} from "../CreateList/page";
import {getAccessToken} from "@/app/Helper";

export interface Item {
    itemID: number | undefined;
    itemName: string;
    itemQuantity: number;
    itemQuantityPurchased: number | undefined;
    itemLink: string;
    itemImageURL: string | null;
    itemImageFile: FormData | undefined;
    itemDescription: string;
}

export async function saveList(listProps: ListProps) {
    const token = await getAccessToken();
    const data: {ownerID: string, itemIDs: number[]} = (
        await axios.post(
            ROUTES.SAVE_LIST,
            listProps,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            )).data;
    return data;
}

export async function saveSharedList(listProps: ListProps) {
    await axios.post(ROUTES.SAVE_PURCHASES, listProps);
}

export async function deleteItems(itemIDs: number[]) {
    await axios.delete(ROUTES.DELETE_ITEMS, {data: {itemIDs}});
}

export async function deleteList(ownerID: string) {
    await axios.delete(ROUTES.DELETE_LIST, {data: {ownerID}})
}

export async function removeSharedList(shareID: string, auth0Owner:string) {
    await axios.delete(ROUTES.REMOVE_SHARED_LIST, {data: {shareID, auth0Owner}})
}