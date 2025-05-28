"use client"
import {useRouter} from "next/navigation";
import {FaRegUserCircle} from "react-icons/fa";

interface NavBarProps {
    text: string;
    link: string;
}

const NavBarElement = ({text, link}: NavBarProps) => {
    const router = useRouter();
    return (<div className={"text-gray-800 bg-orange-400 p-2 rounded-xl hover:bg-orange-300 shadow-md flex justify-center items-center"} onClick={() => router.push(link)}>{text}</div>)
}

export default function NavBar() {
    return (
        <>
            <div className={"w-full bg-gray-400 p-4 border-gray-300 border-4 rounded-xl"}>
                <div className={"flex justify-between"}>
                    <div className={"flex space-x-4 text-2xl cursor-pointer"}>
                        <div className={"pt-2"}>My List Maker: BEYOND</div>
                        <NavBarElement text={"Home"} link={"/"}/>
                        <NavBarElement text={"Create List"} link={"/CreateList"} />
                        <NavBarElement text={"View List"} link={"/ShareList"}/>
                    </div>
                    <div>
                        <FaRegUserCircle size={48} className={"w-full h-full text-orange-400 hover:text-orange-300"}/>
                    </div>
                </div>

            </div>
        </>
    )
}