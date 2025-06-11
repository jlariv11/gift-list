"use client"
import {SessionData} from "@auth0/nextjs-auth0/types";
import {createContext} from "react";

export const SessionContext = createContext<SessionData | null>(null);