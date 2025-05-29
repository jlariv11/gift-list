import ListButton from "../elements/ListButton";
import ReactDOM from "react-dom";
import {IoMdCloseCircleOutline} from "react-icons/io";
import {SimpleItem} from "@/app/ShareList/page";

type ReviewPurchasesProps = {
    setShowReview: (showReview: boolean) => void
    saveItems: () => void
    items: SimpleItem[]
    modalDivID: string
}
export default function ReviewPurchases({setShowReview, items, saveItems, modalDivID}: ReviewPurchasesProps) {

    const createItemContent = (
        <div className={"absolute top-0 left-0 w-full h-full flex justify-center items-center"}>
            <div className={"w-128 h-141 pb-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300 shadow-lg"}>
                <div className={"p-2"}>
                    <div className={"flex justify-between"}>
                        <h1 className={"text-2xl"}>Review Purchases</h1>
                        <IoMdCloseCircleOutline onClick={() => setShowReview(false)} size={32} className={"text-xl text-orange-400 hover:text-orange-300 cursor-pointer"} />
                    </div>
                    <div className={"items-center"}>
                        {items.map((item, index) => <h2 key={index}>{item.itemName}: {item.itemQuantityPurchased}</h2>)}
                        <ListButton buttonText={"Confirm"} onClick={() => {saveItems(); setShowReview(false);}}></ListButton>
                    </div>
                </div>
            </div>
        </div>
    )

    const modalDiv = document.getElementById(modalDivID);
    return (modalDiv !== null) ? ReactDOM.createPortal(createItemContent, modalDiv) : <div></div>;
}