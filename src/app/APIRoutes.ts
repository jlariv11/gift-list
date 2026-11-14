const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const ROUTES = {
    GET_LIST: `${API_URL}/api/lists/load`,
    GET_USER_LISTS: `${API_URL}/api/user/userlists`,
    GET_USER_SHARE_LISTS: `${API_URL}/api/user/usersharelists`,
    SET_USER_SHARE_LIST: `${API_URL}/api/user/setusersharelist`,
    SET_USER_LIST: `${API_URL}/api/user/setuserlist`,
    REMOVE_SHARED_LIST: `${API_URL}/api/user/removesharelist`,
    GET_SHAREID: `${API_URL}/api/lists/shareid`,
    CREATE_SHAREID: `${API_URL}/api/lists/createShareID`,
    SAVE_ITEMS: `${API_URL}/api/items/save`,
    CREATE_LIST: `${API_URL}/api/lists/`,
    UPDATE_LIST_NAME: `${API_URL}/api/lists/updateName`,
    SAVE_PURCHASES: `${API_URL}/api/lists/savepurchases`,
    DELETE_ITEMS: `${API_URL}/api/items/delete`,
    SAVE_IMAGES: `${API_URL}/api/items/saveimages`,
    DELETE_LIST: `${API_URL}/api/lists/delete`,
};