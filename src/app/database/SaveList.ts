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

export async function createList(listName: string) {
    const token = await getAccessToken();
    const data = (await axios.post(ROUTES.CREATE_LIST, {listName: listName}, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    })).data;
    return data;
}

export async function updateListName(listData: {ownerID: string, listName: string}) {
    const token = await getAccessToken();
    await axios.post(ROUTES.UPDATE_LIST_NAME, listData, {
        headers: {
            Authorization: `Bearer ${token}`
        }
    });
}

export async function saveItems(listProps: {ownerID: string, items: Item[]}) {
    const token = await getAccessToken();
    const data: {itemIDs: number[]} = (
        await axios.post(
            ROUTES.SAVE_ITEMS,
            listProps,
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
            )).data;
    data.itemIDs.forEach((itemID, index) => {
        listProps.items[index].itemID = itemID;
    })
}

export async function saveSharedList(listProps: ListProps) {
    await axios.post(ROUTES.SAVE_PURCHASES, listProps);
}

export async function deleteItems(itemIDs: number[], ownerID: string) {
    const token = await getAccessToken();

    await axios.delete(ROUTES.DELETE_ITEMS, {
        data: {
            ownerID,
            itemIDs
        },
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
}

export async function deleteList(ownerID: string) {
    await axios.delete(ROUTES.DELETE_LIST, {data: {ownerID}})
}

export async function removeSharedList(shareID: string, auth0Owner:string) {
    await axios.delete(ROUTES.REMOVE_SHARED_LIST, {data: {shareID, auth0Owner}})
}