export async function getAccessToken() {
    const response = await fetch("/auth/access-token");

    if (!response.ok) {
        throw new Error("Failed to get access token");
    }

    const data = await response.json();

    return data.token;
}