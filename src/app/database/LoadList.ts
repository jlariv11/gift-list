import axios from "axios";
import {Item} from "./SaveList";
import {ROUTES} from "@/app/APIRoutes";

export interface ListData {
    ownerID: string;
    auth0Owner: string | null;
    shareID: string;
    listName: string;
    items: Item[];
}

export async function loadEditList(ownerID: string){
    const data = (await axios.get(ROUTES.GET_LIST, {params: {ownerID: ownerID}})).data;
    const listData: ListData = {
        ownerID: data.ownerID,
        auth0Owner: data.auth0Owner,
        shareID: data.shareID,
        listName: data.listName,
        items: data.Item,
    }
    return listData;
}

export async function getShareID(ownerID: string){
    const data = (await axios.get(ROUTES.GET_SHAREID, {params: {ownerID: ownerID}})).data;
    return data.shareID;
}

export async function loadViewList(shareID: string, shareVisitor: string | undefined){
    const data = (await axios.get(ROUTES.GET_LIST, {params: {shareID: shareID}})).data;
    const listData: ListData = {
        ownerID: data.ownerID,
        auth0Owner: data.auth0Owner,
        shareID: data.shareID,
        listName: data.listName,
        items: data.Item,
    }
    await axios.post(ROUTES.SET_USER_SHARE_LIST, {data: {shareVisitor, shareID}});
    return listData;
}
