"use client"

import {SessionContext} from "@/app/SessionContext";
import {ReactNode} from "react";
import {SessionData} from "@auth0/nextjs-auth0/types";

interface ProviderData {
    children: ReactNode;
    session: SessionData | null;
}

export function Providers ({ children, session }: ProviderData) {
    return (
        <SessionContext.Provider value={session}>
            {children}
        </SessionContext.Provider>
    )
}