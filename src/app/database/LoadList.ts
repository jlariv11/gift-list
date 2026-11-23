import axios from "axios";
import {Item} from "./SaveList";
import {ROUTES} from "../APIRoutes";
import {getAccessToken, getOrIgnoreAccessToken} from "@/app/Helper";

export interface ListData {
    ownerID: string;
    auth0Owner: string | null;
    shareID: string;
    listName: string;
    onlyThisAccount: boolean;
    items: Item[];
    authorized?: boolean;
}

export async function loadEditList(ownerID: string){
    const token = await getOrIgnoreAccessToken();
    const headers = token ? {Authorization: `Bearer ${token}`} : {};
    try{
        const data = (await axios.get(ROUTES.GET_LIST,
            {
                params: {ownerID: ownerID},
                headers: headers
            },
            )).data;
        const listData: ListData = {
            ownerID: data.ownerID,
            auth0Owner: data.auth0Owner,
            shareID: data.shareID,
            listName: data.listName,
            onlyThisAccount: data.onlyThisAccount,
            items: data.Item,
            authorized: true
        }
        return listData;
    }catch(error){
        console.log(error);
        const listData: ListData = {
            ownerID: "",
            auth0Owner: null,
            shareID: "",
            listName: "",
            onlyThisAccount: true,
            items: [],
            authorized: false
        }
        return listData;
    }

}

export async function getShareID(ownerID: string){
    const data = (await axios.get(ROUTES.GET_SHAREID, {params: {ownerID: ownerID}})).data;
    return data.shareID;
}

export async function createShareID(ownerID: string){
    const data = (await axios.post(ROUTES.CREATE_SHAREID, {ownerID})).data;
    return data.shareID;
}

export async function loadViewList(shareID: string){
    const token = await getOrIgnoreAccessToken();
    const data = (await axios.get(ROUTES.GET_LIST, {params: {ownerID: null, shareID: shareID}})).data;
    const listData: ListData = {
        ownerID: data.ownerID,
        auth0Owner: data.auth0Owner,
        shareID: data.shareID,
        listName: data.listName,
        onlyThisAccount: data.onlyThisAccount,
        items: data.Item,
    }
    // If a user is logged in and visits a shared list automatically add it to their account for easy access
    if(token) {
        await axios.post(ROUTES.SET_USER_SHARE_LIST, {shareID},
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
    }
    return listData;
}
