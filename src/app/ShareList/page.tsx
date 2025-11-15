"use client"
import {useContext, useEffect, useState} from "react";
import {Item, saveSharedList} from "../database/SaveList";
import ListButton from "../elements/ListButton";
import {loadViewList} from "../database/LoadList";
import ItemElement from "../elements/ItemElement";
import {useSearchParams} from "next/navigation";
import WarningModal from "@/app/components/WarningModal";
import Modal from "@/app/components/Modal";
import {SessionContext} from "@/app/SessionContext";

export interface SimpleItem {
    itemID: number | undefined;
    itemName: string;
    itemQuantityPurchased: number;
}

export default function ShareList() {
    const [listName, setListName] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [purchasedItems, setPurchasedItems] = useState<SimpleItem[]>([]);
    const [shareID, setShareID] = useState("");
    const [showModal, setShowModal] = useState(false);
    const searchParams = useSearchParams();
    const session = useContext(SessionContext);

    async function fetchList(shareID: string) {
        const listData = await loadViewList(shareID, session ? session.user.email : undefined);
        setListName(listData.listName);
        setItems(listData.items);
        setShareID(listData.shareID);
    }

    useEffect(() => {
        const shareID = searchParams?.get("share");
        if(shareID) {
            fetchList(shareID);
        }
    }, [])

    function updatePurchaseCount(itemID: number | undefined, quantity: number){
        const item = items.find(i => i.itemID === itemID);
        const localItem = purchasedItems.find(i => i.itemID === itemID);
        if(item && localItem) {
            const newQuantity = Math.min(quantity - (item.itemQuantityPurchased || 0), item.itemQuantity);

            if (newQuantity <= 0) {
                setPurchasedItems(prev => prev.filter(i => i.itemID !== itemID));
            } else {
                setPurchasedItems(prev => prev.map(i => i.itemID === itemID ? { ...i, itemQuantityPurchased: newQuantity } : i));
            }
        }else if(item){
            const localItem = {itemID: item.itemID, itemName: item.itemName, itemQuantityPurchased: quantity - (item.itemQuantityPurchased || 0)};
            setPurchasedItems([...purchasedItems, localItem]);
        }
    }

    function saveItems(){
        purchasedItems.forEach((localItem) => {
            const item = items.find(i => i.itemID === localItem.itemID);
            if(item) {
                item.itemQuantityPurchased = localItem.itemQuantityPurchased + (item.itemQuantityPurchased || 0);
            }
        })
        setPurchasedItems([]);
        saveSharedList({listName: listName, ownerID: "", shareID: shareID, items})
    }


    return (
        <div>
            <div className={`m-2 px-4 sm:px-6 md:px-8 flex flex-col items-center transition-all duration-100 ${showModal ? "blur-xs" : ""}`}>
                <div className={"w-full max-w-4xl space-y-1.5"}>
                    <h1 className={"text-4xl"}>View {listName}</h1>
                    <div className={"flex gap-2"}>
                        <div className={"w-2/3 h-150 overflow-y-auto border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                            {items.filter(i => i.itemQuantity !== i.itemQuantityPurchased).map((item) => <ItemElement key={item.itemID} item={item} updatePurchaseCount={updatePurchaseCount}/>)}
                        </div>
                        <div className="w-1/3 h-150 border-4 rounded-md border-gray-400 ml-2 p-4 bg-gray-300 flex flex-col justify-between">
                            <div>
                                <h1 className={"text-xl font-bold"}>Purchases</h1>
                                {purchasedItems.map((item) => (
                                    <div key={item.itemID} className={"pb-2"}>
                                        <h1 className={"text-lg"}>{item.itemName} x {item.itemQuantityPurchased}</h1>
                                        <hr />
                                    </div>
                                ))}
                            </div>

                            <ListButton
                                onClick={() => setShowModal(true)}
                                buttonText="Confirm Purchases"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div id={"modal"}></div>
            {showModal && <Modal modalTitle={"Purchase these Items?"} modalDivID={"modal"} modalBody={<WarningModal toggleModal={setShowModal} warning={"This will mark these items as purchased and will make these items unavailable to purchase by others. Do you want to continue?"} actionFunction={saveItems} />} showModalToggle={setShowModal} />}
        </div>

    )
}