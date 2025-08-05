import ListButton from "@/app/elements/ListButton";
import {IoMdCloseCircleOutline} from "react-icons/io";


interface WarningProps {
    actionFunction: () => void;
    warning: string;
    toggleModal: (toggle: boolean) => void;
}

export default function WarningModal({actionFunction, warning, toggleModal}: WarningProps) {
    return (
        <div className={"absolute top-0 left-0 w-full h-full flex justify-center items-center"}>
            <div className={"w-150 space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <div className={" space-y-2 flex justify-between"}>
                    <h1 className={"text-2xl"}>{warning}</h1>
                    <IoMdCloseCircleOutline onClick={() => toggleModal(false)} size={48} className={"text-xl text-orange-400 hover:text-orange-300 cursor-pointer"} />
                </div>
                <ListButton buttonText={"Confirm"} onClick={() => {actionFunction(); toggleModal(false); }}></ListButton>
            </div>
        </div>
    )
}