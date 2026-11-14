export async function getAccessToken() {
    const response = await fetch("/auth/access-token");

    if (!response.ok) {
        throw new Error("Failed to get access token");
    }

    const data = await response.json();

    return data.token;
}

export async function getOrIgnoreAccessToken(){
    const response = await fetch("/auth/access-token");

    if (!response.ok) {
        return null;
    }

    const data = await response.json();

    return data.token;
}

export async function hasAccessToken() {
    try{
        const token = await getAccessToken();
        return !!token;
    } catch(error){
        return false; // if there is an error no key was retrieved
    }
}