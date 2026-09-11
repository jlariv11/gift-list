import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import {Suspense} from "react";
import Loading from "./loading";
import NavBar from "./components/NavBar";
import {auth0} from "@/lib/auth0";
import {Providers} from "./Providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gift List",
  description: "List maker for gifts",
};


export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

    const session = await auth0.getSession();

  return (
    <html lang="en">
    <Suspense fallback={<Loading />}>
        <body
            className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        >
            <NavBar session={session} />
            <Providers session={session}>
                {children}
            </Providers>
        </body>
    </Suspense>
    </html>
  );
}
