"use client"
import {useContext, useEffect, useState} from "react";
import {deleteItems, deleteList, Item, saveList} from "../database/SaveList";
import ItemElement from "../elements/ItemElement";
import ListButton from "../elements/ListButton";
import ListInput from "../elements/ListInput";
import CreateItem from "../components/CreateItem";
import {useSearchParams} from "next/navigation";
import Notification from "@/app/components/Notification";
import {getShareID, loadEditList} from "@/app/database/LoadList";
import {SessionContext} from "../SessionContext";
import Modal from "@/app/components/Modal";
import WarningModal from "@/app/components/WarningModal";

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
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showNewListModal, setShowNewListModal] = useState(false);
    const [editData, setEditData] = useState<Item>();
    const [ownerID, setOwnerID] = useState("");
    const [shareID, setShareID] = useState<string | undefined>(undefined);
    const [newList, setNewList] = useState(false);
    const [copiedEditLink, setCopiedEditLink] = useState<boolean>(true);

    const [changesSaved, setChangesSaved] = useState(false);

    const searchParams = useSearchParams();
    const session = useContext(SessionContext);

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
            setCopiedEditLink(false);
        }
    }, []);

    async function listChanged(){
        const listData = {
            listName: listName,
            ownerID: ownerID,
            auth0Owner: (newList && session) ? session.user.email : null, // Only want to give ownership if it's a new list
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
        if(!ownerID){
            return;
        }
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
            item.itemImageURL = itemData.itemImageURL;
            item.itemLink = itemData.itemLink;
            item.itemDescription = itemData.itemDescription;
            item.itemImageFile = itemData.itemImageFile;
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

    function deleteAndClearList(){
        deleteList(ownerID);
        clearList();
    }

    function clearList(){
        setOwnerID("");
        setShareID("");
        setItems([]);
        setNewList(true);
        setCopiedEditLink(false);
        setListName("");
    }

    return (
        <div>
            <div className={`m-2 px-4 sm:px-6 md:px-8 flex flex-col items-center transition-all duration-100 ${showAddItem || showEditItem || showDeleteModal ? "blur-xs" : ""}`}>
                <div className={"w-full max-w-4xl space-y-1.5"}>
                    <h1 className={"text-4xl"}>{newList ? "Create New" : "Edit"} List</h1>
                    <div className={"flex justify-between pb-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                        <ListInput label={'List Name: '} type={'text'} value={listName} onChange={(e) => setListName(e.target.value)} onBlur={() => {listChanged(); toggleChangesSaved();}}/>
                        <div hidden={copiedEditLink || !ownerID} className={"pb-4 border-4 rounded-md border-black font-bold p-4 bg-red-600 text-white"}>Please copy the edit link at the bottom to be able to return and edit your list.</div>
                    </div>
                    <div className={"h-108 overflow-y-auto border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                        {items.map((item, index) => <ItemElement key={index} item={item} editItem={fetchEditItem} deleteItem={deleteItem} />)}
                    </div>
                    <div className={"bg-gray-300 border-gray-400 border-4 rounded-md shadow-sm p-4"}>
                        <h2><strong>Edit Link:</strong> <a onClick={() => {addToClipboard(linkFromID(true)); setCopiedEditLink(true)}} className={`cursor-pointer truncate hover:text-orange-400 ${copiedEditLink ? "text-gray-800" : "text-red-600"}`}>{linkFromID(true)}</a></h2>
                        <div>
                            <h2><strong>Share Link:</strong> <a onClick={() => addToClipboard(linkFromID(false))} className={"cursor-pointer text-gray-800 hover:text-orange-400 truncate"}>{linkFromID(false)}</a> <span hidden={!!shareID}> <ListButton onClick={() => handleGetShareID()} buttonText={"Create Sharable Link"} /></span> </h2>
                        </div>
                    </div>
                    <div className={"bg-gray-300 border-gray-400 border-4 rounded-md shadow-sm p-4"}>
                        <div className={"pt-2 flex space-x-1.5"}>
                            <ListButton onClick={() => setShowAddItem(!showAddItem)} buttonText={'Add Item'}/>
                            <ListButton onClick={() => setShowDeleteModal(true)} buttonText={'Delete List'}/>
                            <ListButton onClick={() => setShowNewListModal(true)} buttonText={'New List'}/>
                            {changesSaved && <Notification text={"Changes Saved!"}/>}
                        </div>
                    </div>
                </div>
            </div>
            <div id={"modal"}></div>
            {showAddItem && (
                <Modal modalTitle={"Add Item"} modalBody={<CreateItem setShowAddItem={setShowAddItem} addItem={addItem}/>} modalDivID={"modal"} showModalToggle={setShowAddItem} />
            )}
            {showEditItem && (
                <Modal modalTitle={"Edit Item"} modalBody={<CreateItem setShowAddItem={setShowEditItem} addItem={editItem} itemProps={editData}/>} modalDivID={"modal"} showModalToggle={setShowEditItem} />
            )}
            {showDeleteModal && <Modal modalTitle={"Delete List?"} modalDivID={"modal"} modalBody={<WarningModal toggleModal={setShowDeleteModal} warning={"Are you sure you want to delete this list?"} actionFunction={deleteAndClearList} />} showModalToggle={setShowDeleteModal} />}
            {showNewListModal && <Modal modalTitle={"Create New List?"} modalDivID={"modal"} modalBody={<WarningModal toggleModal={setShowNewListModal} warning={"This will clear your current list. Are you sure?"} actionFunction={clearList} />} showModalToggle={setShowNewListModal} />}

        </div>
    )
}