"use client"
import {useRouter} from "next/navigation";
import ListButton from "@/app/elements/ListButton";
import {SessionData} from "@auth0/nextjs-auth0/types";
import Image from "next/image";

// interface NavBarElementProps {
//     text: string;
//     link: string;
// }

interface NavBarProps {
    session: SessionData | null;
}

// const NavBarElement = ({text, link}: NavBarElementProps) => {
//     const router = useRouter();
//     return (<div className={"text-gray-800 bg-orange-400 p-2 rounded-xl hover:bg-orange-300 shadow-md flex justify-center items-center"} onClick={() => router.push(link)}>{text}</div>)
// }



export default function NavBar({session}: NavBarProps) {
    const router = useRouter();
    return (
        <>
            <div className={"w-full bg-gray-400 p-4 border-gray-300 border-4 rounded-xl"}>
                <div className={"flex justify-between"}>
                    <div className={"flex space-x-4 text-2xl cursor-pointer"}>
                        <div className={"pt-2"}>My List Maker: BEYOND</div>
                        {/*<NavBarElement text={"Create List"} link={"/CreateList"} />*/}
                        {/*<NavBarElement text={"View List"} link={"/ShareList"}/>*/}
                    </div>
                    <div>
                        {session ? <Image className={"hover:cursor-pointer"} onClick={() => router.push("/AccountPage")} src={session.user.picture || ""} alt={"User Icon"} width={50} height={50}/> : <ListButton buttonText={"Log In"} onClick={() => window.location.href = "auth/login"} />}
                    </div>
                </div>

            </div>
        </>
    )
}