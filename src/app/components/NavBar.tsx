"use client"

import { useRouter } from "next/navigation";
import ListButton from "../elements/ListButton";
import { SessionData } from "@auth0/nextjs-auth0/types";
import Image from "next/image";
import {hasAccessToken} from "@/app/Helper";
import {useEffect, useState} from "react";

interface NavBarProps {
    session: SessionData | null;
}

export default function NavBar({ session }: NavBarProps) {
    const router = useRouter();
    const [accessToken, setHasAccessToken] = useState(false);
    useEffect(() => {
        hasAccessToken().then(setHasAccessToken);
    }, []);
    return (
        <nav className="w-full border-b border-border bg-page">
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-5 lg:px-8">

                {/* Logo */}
                <button onClick={() => router.push("/LandingPage")} className="text-2xl font-semibold tracking-tight text-foreground transition-opacity hover:opacity-70">Gift List</button>

                {/* Account */}
                <div className="flex items-center">
                    {accessToken? (<button onClick={() => router.push("/AccountPage")} className="rounded-full transition-opacity hover:opacity-80" aria-label="Open account"><Image className="h-11 w-11 rounded-full object-cover" src={session?.user.picture || ""} alt="User profile" width={44} height={44}/></button>) : (<ListButton buttonText="Log In" onClick={() => window.location.href = "/auth/login"}/>)}
                </div>

            </div>
        </nav>
    );
}