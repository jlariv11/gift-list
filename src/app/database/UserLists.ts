import axios from "axios";
import {ROUTES} from "../APIRoutes";

export async function getUserListInfo() {
    const token = await getAccessToken();

    return (
        await axios.get(ROUTES.GET_USER_LISTS, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
    ).data;
}

export async function getUserSharedListInfo(auth0Owner: string) {
    return (
        await axios.get(ROUTES.GET_USER_SHARE_LISTS, {
            params: { auth0Owner }
        })
    ).data;
}

export async function addUserToList(link: string) {
    const token = await getAccessToken();

    return (
        await axios.post(
            ROUTES.SET_USER_LIST,
            {
                ownerID: link.split("owner=")[1],
            },
            {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            }
        )
    ).data;
}

export async function addUserToSharedList(link: string, auth0Owner: string) {
    return (
        await axios.post(ROUTES.SET_USER_SHARE_LIST, {
            auth0Owner,
            shareID: link.split("share=")[1]
        })
    ).data;
}