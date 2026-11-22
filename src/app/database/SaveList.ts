import axios from "axios";
import {ROUTES} from "../APIRoutes";
import {ListProps} from "../CreateList/page";
import {getAccessToken, getOrIgnoreAccessToken} from "@/app/Helper";

export interface Item {
    itemID: number | undefined;
    itemName: string;
    itemQuantity: number;
    itemQuantityPurchased: number | undefined;
    itemLink: string;
    itemImageURL: string | null;
    itemDescription: string;
}

export async function createList(listName: string) {
    const token = await getOrIgnoreAccessToken();
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    const data = (await axios.post(ROUTES.CREATE_LIST, {listName: listName}, {
        headers: headers,
    })).data;
    return data;
}

export async function updateListName(listData: {ownerID: string, listName: string}) {
    const token = await getOrIgnoreAccessToken();
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    await axios.patch(
        `${ROUTES.LIST}/${listData.ownerID}`,
        {
            listName: listData.listName,
        },
        {
            headers: headers,
        }
    );
}

export async function saveItems(listProps: {ownerID: string, items: Item[]}) {
    const token = await getOrIgnoreAccessToken();
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    const data: {itemIDs: number[]} = (
        await axios.post(
            ROUTES.SAVE_ITEMS,
            listProps,
            {
               headers: headers
            }
            )).data;
    data.itemIDs.forEach((itemID, index) => {
        listProps.items[index].itemID = itemID;
    })
}

export async function saveSharedList(listProps: ListProps) {
    await axios.patch(ROUTES.SAVE_PURCHASES, {
        shareID: listProps.shareID,
        items: listProps.items.map(item => ({
            itemID: item.itemID,
            itemQuantityPurchased: item.itemQuantityPurchased ?? 0,
        })),
    });
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
    const token = await getAccessToken();
    await axios.delete(ROUTES.DELETE_LIST, {data: {ownerID}, headers: {
            Authorization: `Bearer ${token}`,
        }})
}

export async function removeSharedList(shareID: string) {
    const token = await getAccessToken();
    await axios.delete(ROUTES.REMOVE_SHARED_LIST, {data: {shareID},
        headers: {
            Authorization: `Bearer ${token}`,
        }
    })
}