"use client"
import {useEffect, useState} from "react";
import {deleteItems, Item, saveList} from "../database/SaveList";
import ItemElement from "../elements/ItemElement";
import ListButton from "../elements/ListButton";
import ListInput from "../elements/ListInput";
import {getShareID, loadEditList} from "../database/LoadList";
import CreateItem from "../components/CreateItem";
import {useSearchParams} from "next/navigation";

export interface ListProps {
    listName: string;
    ownerID: string;
    shareID: string | undefined;
    items: Item[];
}

export default function CreateList() {
    const [listName, setListName] = useState('');
    const [items, setItems] = useState<Item[]>([]);
    const [showAddItem, setShowAddItem] = useState(false);
    const [showEditItem, setShowEditItem] = useState(false);
    const [editData, setEditData] = useState<Item>();
    const [ownerID, setOwnerID] = useState("");
    const [shareID, setShareID] = useState<string | undefined>(undefined);
    const [newList, setNewList] = useState(false);

    const [changesSaved, setChangesSaved] = useState(false);

    const searchParams = useSearchParams();

    function linkFromID(edit: boolean): string {
        if (edit && !ownerID) {
            return "";
        }
        if (!edit && !shareID) {
            return "";
        }

        const baseUrl = window.location.origin;
        const param = edit ? `owner=${ownerID}` : `share=${shareID}`;
        return `${baseUrl}?${param}`;
    }


    useEffect(() => {
        const ownerID = searchParams?.get("owner");
        if(ownerID) {
            loadEditList(ownerID).then((listData) => {
                setListName(listData.listName);
                setItems(listData.items);
                setOwnerID(listData.ownerID);
                setShareID(listData.shareID);
            })
        }else{
            setNewList(true);
        }
    }, []);

    async function listChanged(){
        const listData = {
            listName: listName,
            ownerID: ownerID,
            shareID: shareID,
            items: items,
        }
        const id = await saveList(listData);
        if(newList){
            setOwnerID(id);
            setNewList(false);
        }
    }

    useEffect(() => {
        if(items.length > 0) {
            listChanged();
        }
    }, [items]);

    function addItem(item: Item) {
        setItems([...items, item]);
        toggleChangesSaved();
    }

    async function handleGetShareID(){
        const id = await getShareID(ownerID);
        setShareID(id);
    }

    function fetchEditItem(itemID: number) {
        const item = items.find(i => i.itemID === itemID);
        if (item) {
            setEditData(item);
            setShowEditItem(true);
        }
    }
    function editItem(itemData: Item) {
        const item = items.find(i => i.itemID === itemData.itemID);
        if (item) {
            item.itemName = itemData.itemName;
            item.itemQuantity = itemData.itemQuantity;
            item.itemImage = itemData.itemImage;
            item.itemLink = itemData.itemLink;
            item.itemDescription = itemData.itemDescription;
            setEditData(undefined);
            listChanged();
            toggleChangesSaved();
        }
    }

    async function deleteItem(itemID: number) {
        await deleteItems([itemID]);
        setItems(items.filter(i => i.itemID !== itemID));
        toggleChangesSaved();

    }

    function toggleChangesSaved(){
        setChangesSaved(true);
        setTimeout(() => setChangesSaved(false), 2000);
    }

    function addToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"))
    }

    return (
        <div>
            <div className={`m-2 flex flex-col items-center transition-all duration-100 ${showAddItem || showEditItem ? "blur-xs" : ""}`}>
                <div className={"w-full max-w-4xl space-y-1.5"}>
                    <h1 className={"text-4xl"}>{newList ? "Edit" : "Create New"} List</h1>
                    {changesSaved && <h2 className={"text-blue-600 text-xl"}>Changes Saved!</h2>}
                    <div className={"pb-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                        <ListInput label={'List Name: '} type={'text'} value={listName} onChange={(e) => setListName(e.target.value)} onFinishEdit={() => listChanged()}/>
                    </div>
                    <div className={"h-108 overflow-y-auto border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                        {items.map((item, index) => <ItemElement key={index} itemID={item.itemID} itemName={item.itemName} itemQuantity={item.itemQuantity} itemQuantityPurchased={item.itemQuantityPurchased} itemLink={item.itemLink} itemImage={item.itemImage} itemDescription={item.itemDescription} editItem={fetchEditItem} deleteItem={deleteItem} />)}
                    </div>
                    <div className={"bg-gray-300 border-gray-400 border-4 rounded-md shadow-sm p-4"}>
                        <h2><strong>Edit Link:</strong> <a onClick={() => addToClipboard(linkFromID(true))} className={"cursor-pointer text-gray-800 hover:text-orange-400"}>{linkFromID(true)}</a></h2>
                        <div>
                            <h2><strong>Share Link:</strong> <a onClick={() => addToClipboard(linkFromID(false))} className={"cursor-pointer text-gray-800 hover:text-orange-400"}>{linkFromID(false)}</a> <span hidden={!!shareID}> <ListButton onClick={() => handleGetShareID()} buttonText={"Create Sharable Link"} /></span> </h2>
                        </div>
                    </div>
                    <div className={"pt-2"}>
                        <ListButton onClick={() => setShowAddItem(!showAddItem)} buttonText={'Add Item'}/>
                    </div>
                </div>
            </div>
            <div id={"addEditModal"}></div>
            {showAddItem && (
                <CreateItem setShowAddItem={setShowAddItem} addItem={addItem} modalDivID={"addEditModal"} />
            )}
            {showEditItem && (
                <CreateItem setShowAddItem={setShowEditItem} addItem={editItem} itemProps={editData} modalDivID={"addEditModal"} />
            )}
        </div>
    )
}