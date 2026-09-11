const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const ROUTES = {
    GET_LIST: `${API_URL}/api/lists/fetch`,
    GET_USER_LISTS: `${API_URL}/api/lists/userlists`,
    GET_USER_SHARE_LISTS: `${API_URL}/api/lists/usersharelists`,
    SET_USER_SHARE_LIST: `${API_URL}/api/lists/setusersharelist`,
    SET_USER_LIST: `${API_URL}/api/lists/setuserlist`,
    REMOVE_SHARED_LIST: `${API_URL}/api/lists/removesharelist`,
    GET_SHAREID: `${API_URL}/api/lists/shareid`,
    SAVE_LIST: `${API_URL}/api/lists/save`,
    CREATE_LIST: `${API_URL}/api/lists/`,
    SAVE_PURCHASES: `${API_URL}/api/lists/savepurchases`,
    DELETE_ITEMS: `${API_URL}/api/items`,
    SAVE_IMAGES: `${API_URL}/api/items/saveimages`,
    DELETE_LIST: `${API_URL}/api/lists/deletelist`,
};