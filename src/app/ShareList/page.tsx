"use client"
import {useEffect, useState} from "react";
import {Item, saveSharedList} from "../database/SaveList";
import ListButton from "../elements/ListButton";
import {loadViewList} from "../database/LoadList";
import ItemElement from "../elements/ItemElement";

export default function ShareList() {
    const [listName, setListName] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [shareID, setShareID] = useState("");
    // const location = useLocation();
    // const data = location.state as {shareID: string}
    const data = {shareID: ""}

    async function fetchList() {
        const listData = await loadViewList(data.shareID);
        setListName(listData.listName);
        setItems(listData.items);
        setShareID(listData.shareID);
    }

    useEffect(() => {
        if(data) {
            fetchList();
        }
    }, [])

    function updatePurchaseCount(itemID: number | undefined, quantity: number){
        const item = items.find(i => i.itemID === itemID);
        if(item && itemID){
            item.itemQuantityPurchased = quantity;
        }
    }


    return (
        <div className={'m-2 flex flex-col items-center'}>
            <div className={"w-full max-w-4xl space-y-1.5"}>
                <h1 className={"text-4xl"}>View {listName}</h1>
                <div className={"h-108 overflow-y-auto border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                    {items.filter(i => i.itemQuantity !== i.itemQuantityPurchased).map((item, index) => <ItemElement key={index}  itemID={item.itemID} itemName={item.itemName} itemQuantity={item.itemQuantity} itemQuantityPurchased={item.itemQuantityPurchased} itemLink={item.itemLink} itemImage={item.itemImage} itemDescription={item.itemDescription} updatePurchaseCount={updatePurchaseCount}/>)}
                </div>
                <div>
                    <ListButton onClick={() => saveSharedList({listName: listName, ownerID: "", shareID: shareID, items})} buttonText={'Save Purchases'}/>
                </div>
            </div>
        </div>
    )
}