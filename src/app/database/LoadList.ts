import axios from "axios";
import {Item} from "./SaveList";
import {ROUTES} from "../APIRoutes";
import {getAccessToken} from "@/app/Helper";

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

export async function createShareID(ownerID: string){
    const data = (await axios.post(ROUTES.CREATE_SHAREID, {ownerID})).data;
    console.log(data.shareID);
    console.log(data)
    return data.shareID;
}

export async function loadViewList(shareID: string){
    const token = await getAccessToken();
    const data = (await axios.get(ROUTES.GET_LIST, {params: {shareID: shareID}})).data;
    const listData: ListData = {
        ownerID: data.ownerID,
        auth0Owner: data.auth0Owner,
        shareID: data.shareID,
        listName: data.listName,
        items: data.Item,
    }
    if(token) {
        //TODO: await axios.post(ROUTES.SET_USER_SHARE_LIST, {data: {shareVisitor, shareID}});
    }
    return listData;
}
