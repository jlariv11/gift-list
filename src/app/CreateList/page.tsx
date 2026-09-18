"use client";

import {useEffect, useRef, useState} from "react";

import {createList, deleteItems, deleteList, Item, saveItems, updateListName} from "../database/SaveList";

import ItemElement from "../elements/ItemElement";
import ListButton from "../elements/ListButton";
import ListInput from "../elements/ListInput";
import CreateItem from "../components/CreateItem";
import { useSearchParams } from "next/navigation";
import Notification from "../components/Notification";
import {createShareID, loadEditList} from "../database/LoadList";
import Modal from "../components/Modal";
import WarningModal from "../components/WarningModal";
import { getAccessToken } from "@/app/Helper";

import {FaPlus, FaLink, FaPen, FaTrashCan, FaArrowRotateRight} from "react-icons/fa6";

export interface ListProps {
    listName: string;
    ownerID: string;
    shareID: string | undefined;
    items: Item[];
}

export default function CreateList() {
    const [listName, setListName] = useState("Untitled List");
    const [items, setItems] = useState<Item[]>([]);
    const [dirtyItems, setDirtyItems] = useState<Item[]>([]);

    const [showAddItem, setShowAddItem] = useState(false);
    const [showEditItem, setShowEditItem] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showNewListModal, setShowNewListModal] = useState(false);

    const [editData, setEditData] = useState<Item>();

    const [ownerID, setOwnerID] = useState("");
    const [shareID, setShareID] = useState<string | undefined>(undefined);

    const [newList, setNewList] = useState(false);
    const [copiedEditLink, setCopiedEditLink] = useState(true);

    const [changesSaved, setChangesSaved] = useState(false);

    const searchParams = useSearchParams();
    const hasInitialized = useRef(false);

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
        if (hasInitialized.current) {
            return;
        }

        hasInitialized.current = true;

        const ownerID = searchParams?.get("owner");

        if (ownerID) {
            loadEditList(ownerID).then((listData) => {
                setListName(listData.listName);
                setItems(listData.items);
                setOwnerID(listData.ownerID);
                setShareID(listData.shareID);
            });
        } else {
            setNewList(true);
            setCopiedEditLink(false);

            createList(listName).then((id) => setOwnerID(id));

            getAccessToken().then((accessToken) => {
                if (accessToken) {
                    setCopiedEditLink(true);
                }
            });
        }
    }, []);

    async function listChanged() {
        const listData = {
            ownerID,
            items: dirtyItems,
        };

        await saveItems(listData);

        setItems([...items, ...dirtyItems]);
        setDirtyItems([]);

        toggleChangesSaved();
    }

    useEffect(() => {
        if (dirtyItems.length > 0) {
            listChanged();
        }
    }, [dirtyItems]);

    useEffect(() => {
        if (!ownerID || !listName) {
            return;
        }

        const listData = {
            listName,
            ownerID,
        };

        updateListName(listData);
    }, [listName]);

    function addItem(item: Item) {
        setDirtyItems([...dirtyItems, item]);
    }

    async function handleGetShareID() {
        if (!ownerID) {
            return;
        }

        const id = await createShareID(ownerID);
        setShareID(id);
    }

    function fetchEditItem(itemID: number) {
        const item = items.find((i) => i.itemID === itemID);

        if (item) {
            setEditData(item);
            setShowEditItem(true);
        }
    }

    function editItem(itemData: Item) {
        const item = items.find(
            (i) => i.itemID === itemData.itemID
        );

        if (item) {
            item.itemName = itemData.itemName;
            item.itemQuantity = itemData.itemQuantity;
            item.itemImageURL = itemData.itemImageURL;
            item.itemLink = itemData.itemLink;
            item.itemDescription = itemData.itemDescription;

            setEditData(undefined);

            addItem(item);

            setItems(
                items.filter((i) => i.itemID !== item.itemID)
            );
        }
    }

    async function deleteItem(itemID: number) {
        await deleteItems([itemID], ownerID);

        setItems(
            items.filter((i) => i.itemID !== itemID)
        );
    }

    function toggleChangesSaved() {
        setChangesSaved(true);

        setTimeout(() => {
            setChangesSaved(false);
        }, 2000);
    }

    function addToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => {
            toggleChangesSaved();
        });
    }

    function deleteAndClearList() {
        deleteList(ownerID);
        clearList();
    }

    function clearList() {
        setOwnerID("");
        setShareID("");
        setItems([]);
        setNewList(true);
        setCopiedEditLink(false);
        setListName("");
    }

    const modalOpen =
        showAddItem ||
        showEditItem ||
        showDeleteModal ||
        showNewListModal;

    return (
        <>
            <main className={` min-h-screen bg-page transition duration-150 ${modalOpen ? "blur-[1px]" : ""} `}>
                <div className=" mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                    {/* Header */}
                    <header className=" mb-8 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <p className=" mb-1 text-sm font-medium text-muted">{newList ? "New gift list" : "Your gift list"}</p>
                            <h1 className=" text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">{listName || "Untitled List"}</h1>

                            <p className="mt-2 text-sm text-muted">{items.length === 0 ? "Start adding gifts to your list." : `${items.length} ${items.length === 1 ? "gift" : "gifts"}`}</p>
                        </div>

                        <ListButton buttonText="Add gift" buttonIcon={<FaPlus />} onClick={() => setShowAddItem(true)}/>
                    </header>

                    {/* Edit list name */}
                    <section className=" mb-8 rounded-xl border border-border bg-surface p-5">
                        <div className=" flex items-start gap-3">
                            <div className=" mt-1 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                                <FaPen className="text-xs" />
                            </div>

                            <div className="w-full max-w-lg">
                                <ListInput label="List name" type="text" value={listName}
                                    onChange={(e) =>
                                        setListName(e.target.value)
                                    }
                                    onBlur={() => {
                                        listChanged();
                                        toggleChangesSaved();
                                    }}
                                />
                            </div>
                        </div>
                    </section>

                    {/* Edit-link notice */}
                    {!copiedEditLink && (
                        <div className=" mb-6 rounded-lg border border-[#E7D9B9] bg-[#FBF7ED] px-4 py-3">
                            <p className=" text-sm leading-6 text-[#665B40]">Save your edit link below so you can return and make changes to this list.</p>
                        </div>
                    )}

                    {/* Gifts */}
                    <section className="mb-10">

                        <div className=" mb-4 flex items-center justify-between">
                            <h2 className=" text-lg font-semibold text-foreground">Gifts</h2>
                        </div>

                        {items.length > 0 ? (
                            <div>
                                {items.map((item) => (
                                    <ItemElement
                                        key={item.itemID}
                                        item={item}
                                        editItem={fetchEditItem}
                                        deleteItem={deleteItem}
                                    />
                                ))}
                            </div>
                        ) : (
                            <div className=" flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
                                <div className=" mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary"><FaPlus /></div>

                                <h3 className=" text-base font-medium text-foreground">Your list is empty</h3>

                                <p className=" mt-1 max-w-sm text-sm leading-6 text-muted">Add something you&#39;ve had your eye on and it will show up here.</p>

                                <ListButton className="mt-5" buttonText="Add your first gift" onClick={() => setShowAddItem(true)}/>
                            </div>
                        )}
                    </section>

                    {/* Sharing */}
                    <section className=" mb-6 rounded-xl border border-border bg-surface p-5 sm:p-6">
                        <div className="mb-5">
                            <div className=" flex items-center gap-2">
                                <FaLink className=" text-sm text-primary"/>
                                <h2 className=" text-lg font-semibold text-foreground">Share your list</h2>
                            </div>
                            <p className=" mt-1 text-sm leading-6 text-muted">Share your list with friends and family or save your private edit link.</p>
                        </div>

                        <div className="divide-y divide-border">

                            {/* Share link */}
                            <div className=" flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className=" text-sm font-medium text-foreground">Share link</p>
                                    <p className=" mt-1 text-xs text-muted">Anyone with this link can view your list.</p>
                                </div>

                                {shareID ?
                                    (<ListButton variant="secondary" buttonText="Copy link" buttonIcon={<FaLink />} onClick={() => addToClipboard(linkFromID(false))}/>)
                                    :
                                    (<ListButton variant="secondary" buttonText="Create share link" buttonIcon={<FaLink />} onClick={handleGetShareID}/>)}
                            </div>

                            {/* Edit link */}
                            <div className=" flex flex-col gap-3 py-4 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
                                <div>
                                    <p className=" text-sm font-medium text-foreground">Private edit link</p>

                                    <p className=" mt-1 text-xs text-muted">Keep this link private. It allows you to edit your list.</p>
                                </div>

                                <ListButton variant={copiedEditLink ? "secondary" : "primary"} buttonText="Copy edit link" buttonIcon={<FaPen />} onClick={() => {addToClipboard(linkFromID(true));setCopiedEditLink(true);}}/>
                            </div>
                        </div>
                    </section>

                    {/* List management */}
                    <section className=" flex flex-col gap-3 border-t border-border pt-6 sm:flex-row sm:items-center sm:justify-between">
                        <ListButton variant="secondary" buttonText="New list" buttonIcon={<FaArrowRotateRight />} onClick={() => setShowNewListModal(true)}/>

                        <ListButton variant="ghost" className=" text-danger hover:bg-danger-light hover:text-danger" buttonText="Delete list" buttonIcon={<FaTrashCan />} onClick={() => setShowDeleteModal(true)}/>
                    </section>

                    {/* Save notification */}
                    {changesSaved && (<div className=" fixed bottom-6 left-1/2 z-40 -translate-x-1/2"><Notification text="Changes saved" /></div>)}
                </div>
            </main>

            <div id="modal" />

            {showAddItem && (<Modal modalTitle="Add a gift" modalBody={<CreateItem setShowAddItem={setShowAddItem} addItem={addItem}/>} modalDivID="modal" showModalToggle={setShowAddItem}/>)}

            {showEditItem && (<Modal modalTitle="Edit gift" modalBody={<CreateItem setShowAddItem={setShowEditItem} addItem={editItem} itemProps={editData}/>} modalDivID="modal" showModalToggle={setShowEditItem}/>)}

            {showDeleteModal && (<Modal modalTitle="Delete list?" modalDivID="modal" modalBody={<WarningModal toggleModal={setShowDeleteModal} warning="Are you sure you want to delete this list?" actionFunction={deleteAndClearList}/>} showModalToggle={setShowDeleteModal}/>)}

            {showNewListModal && (<Modal modalTitle="Create a new list?" modalDivID="modal" modalBody={<WarningModal toggleModal={setShowNewListModal} warning="This will clear your current list. Are you sure?" actionFunction={clearList}/>} showModalToggle={setShowNewListModal}/>)}
        </>
    );
}