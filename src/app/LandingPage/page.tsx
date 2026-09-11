"use client"
import ListButton from "../elements/ListButton";
import {useRouter} from "next/navigation";
import {useEffect} from "react";
import axios from "axios";
import {ROUTES} from "../APIRoutes"

export default function LandingPage() {
    const router = useRouter();

    // useEffect(() => {
    //     async function createList() {
    //         try {
    //             // Get access token from Auth0
    //             const tokenResponse = await fetch("/auth/access-token");
    //
    //             if (!tokenResponse.ok) {
    //                 throw new Error("Failed to get access token");
    //             }
    //
    //             const { token } = await tokenResponse.json();
    //
    //             // Call Express API with the token
    //             const response = await axios.post(
    //                 ROUTES.CREATE_LIST,
    //                 {}, // request body
    //                 {
    //                     headers: {
    //                         Authorization: `Bearer ${token}`,
    //                     },
    //                 }
    //             );
    //
    //             console.log(response.data);
    //         } catch (err) {
    //             console.error("Failed to create list:", err);
    //         }
    //     }
    //
    //     createList();
    // }, []);

    return (
        <div className="flex items-center justify-center min-h-screen bg-gradient-to-b from-pink-50 to-pink-100 px-6">
            <div className="max-w-2xl text-center space-y-6">
                <h1 className="text-2xl lg:text-5xl font-bold text-gray-800 leading-tight">
                    Create a gift list to share your gift requests with friends and family
                </h1>
                <p className="text-lg lg:text-2xl text-gray-700">
                    Sign in to keep your lists saved in one central place
                </p>
                <p className="text-lg lg:text-2xl text-gray-700">
                    No account necessary — revisit your list anytime with your unique edit link
                </p>

                <div className="pt-6">
                    <ListButton
                        buttonText="Create a List Now"
                        onClick={() => router.push("/CreateList")}
                    />
                </div>
            </div>
        </div>

    )
}