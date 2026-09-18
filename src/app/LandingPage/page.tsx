"use client";

import ListButton from "../elements/ListButton";
import {useRouter} from "next/navigation";
import {FaArrowRight, FaCheck, FaGift} from "react-icons/fa6";
import {useEffect, useState} from "react";
import {hasAccessToken} from "@/app/Helper";

export default function LandingPage() {
    const router = useRouter();
    const [accessToken, setHasAccessToken] = useState(false);
    useEffect(() => {
        hasAccessToken().then(setHasAccessToken);
    }, []);
    return (
        <main className="min-h-[calc(100vh-85px)] bg-page">
            <div className="mx-auto flex min-h-[calc(100vh-85px)] w-full max-w-6xl items-center px-6 py-16 lg:px-8">
                <div className=" grid w-full items-center gap-16 lg:grid-cols-[1.05fr_0.95fr]">
                    {/* Hero */}
                    <section>
                        <div className=" mb-6 inline-flex items-center gap-2 rounded-full bg-primary-light px-3 py-1.5 text-sm font-medium text-primary">
                            <FaGift className="text-xs"/>
                            Gift giving, made simpler
                        </div>

                        <h1 className=" max-w-2xl text-4xl font-semibold leading-[1.1] tracking-tight text-foreground sm:text-5xl lg:text-6xl">Keep the things you&apos;d love in one place.</h1>

                        <p className=" mt-6 max-w-xl text-base leading-7 text-muted sm:text-lg">
                            Create a gift list and share it with friends
                            and family. No guessing, no duplicate gifts,
                            and no account required.
                        </p>

                        <div className=" mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
                            <ListButton className="px-5 py-3" buttonText="Create a list" buttonIcon={<FaArrowRight/>} onClick={() => router.push("/CreateList")}/>

                            {!accessToken && <button type="button" onClick={() => window.location.href = "/auth/login"} className=" rounded-lg px-5 py-3 text-sm font-medium text-muted transition-colors hover:bg-surface-muted hover:text-foreground">Sign in</button>}
                        </div>

                        <div className=" mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-muted">
                            <Feature text="No account required"/>
                            <Feature text="Free to use"/>
                            <Feature text="Easy to share"/>
                        </div>
                    </section>

                    {/* List preview */}
                    <section className="hidden lg:block">
                        <div className=" rounded-2xl border border-border bg-surface p-6 shadow-sm">
                            <div className=" mb-6 flex items-start justify-between">
                                <div>
                                    <p className="text-xs font-medium text-muted">MY GIFT LIST</p>
                                    <h2 className=" mt-1 text-2xl font-semibold tracking-tight text-foreground">Birthday ideas</h2>
                                </div>
                                <div className=" rounded-lg bg-primary-light px-3 py-2 text-xs font-medium text-primary">3 gifts</div>
                            </div>

                            <div className="space-y-3">
                                <PreviewGift name="Noise cancelling headphones" description="Black" symbol="🎧"/>
                                <PreviewGift name="Coffee grinder" description="For pour-over coffee" symbol="☕"/>
                                <PreviewGift name="Running shoes" description="Size 10 · Gray" symbol="👟"/>
                            </div>

                            <div className=" mt-5 border-t border-border pt-4">
                                <p className="text-xs text-muted">Share this list with friends and family</p>
                            </div>
                        </div>
                    </section>
                </div>
            </div>
        </main>
    );
}

function Feature({text}: { text: string }) {
    return (
        <div className="flex items-center gap-2">
            <div className=" flex h-5 w-5 items-center justify-center rounded-full bg-primary-light text-primary">
                <FaCheck className="text-[9px]"/>
            </div>
            <span>{text}</span>
        </div>
    );
}

function PreviewGift({name, description, symbol}: { name: string; description: string; symbol: string; }) {
    return (
        <div className=" flex items-center gap-4 rounded-xl border border-border p-3">
            <div className=" flex h-16 w-16 shrink-0 items-center justify-center rounded-lg bg-page text-2xl">{symbol}</div>

            <div className="min-w-0"><p className=" truncate text-sm font-medium text-foreground">{name}</p>
                <p className="mt-1 text-xs text-muted">{description}</p>
            </div>
        </div>
    );
}