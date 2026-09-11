"use client"
import {useRouter} from "next/navigation";
import ListButton from "../elements/ListButton";
import {SessionData} from "@auth0/nextjs-auth0/types";
import Image from "next/image";

interface NavBarProps {
    session: SessionData | null;
}

export default function NavBar({session}: NavBarProps) {
    const router = useRouter();
    return (
        <>
            <div className={"w-full bg-gray-400 p-4 border-gray-300 border-4 rounded-xl"}>
                <div className={"flex justify-between"}>
                    <div className={"flex space-x-4 text-4xl cursor-pointer"}>
                        <div onClick={() => router.push("/LandingPage")} className={"pt-2"}>Gift List</div>
                    </div>
                    <div>
                        {session ? <Image className={"hover:cursor-pointer"} onClick={() => router.push("/AccountPage")} src={session.user.picture || ""} alt={"User Icon"} width={50} height={50}/> : <ListButton buttonText={"Log In"} onClick={() => window.location.href = "/auth/login"} />}
                    </div>
                </div>

            </div>
        </>
    )
}