import axios from "axios";
import {ROUTES} from "@/app/APIRoutes";

export async function getUserListInfo(auth0Owner: string){
    return (await axios.get(ROUTES.GET_USER_LISTS, {params: {auth0Owner: auth0Owner}})).data;
}

export async function addUserToList(link: string, auth0Owner: string){
    return (await axios.post(ROUTES.SET_USER_LIST, {data: {auth0Owner: auth0Owner, ownerID: link.split("owner=")[1]}})).data;
}