"use client"
import {useEffect, useState} from "react";
import {Item, saveSharedList} from "../database/SaveList";
import ListButton from "../elements/ListButton";
import {loadViewList} from "../database/LoadList";
import ItemElement from "../elements/ItemElement";
import {useSearchParams} from "next/navigation";
import ReviewPurchases from "@/app/components/ReviewPurchases";

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

    async function fetchList(shareID: string) {
        const listData = await loadViewList(shareID);
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
            localItem.itemQuantityPurchased = Math.min(quantity - (item.itemQuantityPurchased || 0), item.itemQuantity);
            if(localItem.itemQuantityPurchased <= 0) {
                setPurchasedItems(purchasedItems.filter(i => i.itemID !== itemID));
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
                    <div className={"h-108 overflow-y-auto border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                        {items.filter(i => i.itemQuantity !== i.itemQuantityPurchased).map((item, index) => <ItemElement key={index} item={item} updatePurchaseCount={updatePurchaseCount}/>)}
                    </div>
                    <div>
                        <ListButton onClick={() => setShowModal(true)} buttonText={'Review Purchases'}/>
                    </div>
                </div>
            </div>
            <div id={"modal"}></div>
            {showModal && <ReviewPurchases setShowReview={setShowModal} modalDivID={"modal"} saveItems={saveItems} items={purchasedItems}/>}
        </div>

    )
}