"use client"
import {SessionContext} from "../SessionContext";
import {useContext, useEffect, useState} from "react";
import ListButton from "@/app/elements/ListButton";
import Modal from "@/app/components/Modal";
import ListInput from "@/app/elements/ListInput";
import {addUserToList, addUserToSharedList, getUserListInfo, getUserSharedListInfo} from "@/app/database/UserLists";
import {SessionData} from "@auth0/nextjs-auth0/types";
import {FaTrashCan} from "react-icons/fa6";
import {deleteList, removeSharedList} from "@/app/database/SaveList";
import WarningModal from "@/app/components/WarningModal";
import {useRouter} from "next/navigation";

interface ListProps {
    ownerID: string;
    shareID: string;
    listName: string;
}

interface SharedListProps {
    sharedListName: string;
    accountSharedTo: string;
    id: number;
    shareID: string;
}

type ListModalProps = {
    session: SessionData | null;
    updateLists: () => void;
    setAddListModal: (modalToggle: boolean) => void
}

const ListModal = (props: ListModalProps) => {
    const [link, setLink] = useState("");

    function submit() {
        if (props.session && props.session.user.email) {
            if (link.includes("owner")) {
                addUserToList(link, props.session.user.email).then(() => {
                    props.updateLists();
                    props.setAddListModal(false);
                })
            } else if (link.includes("share")) {
                addUserToSharedList(link, props.session.user.email).then(() => {
                    props.updateLists();
                    props.setAddListModal(false);
                })
            }
        }
    }

    return (
        <div>
            <div className={"w-100 space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <ListInput type={"text"} value={link} label={"List Link:"}
                           onChange={(e) => setLink(e.target.value)}></ListInput>
                <ListButton buttonText={"Submit"} onClick={() => submit()}></ListButton>
            </div>
        </div>
    )
}

export default function AccountPage() {

    const session = useContext(SessionContext);
    const [lists, setLists] = useState<ListProps[]>([]);
    const [sharedLists, setSharedLists] = useState<SharedListProps[]>([]);
    const [addListModal, setAddListModal] = useState(false);
    const [deleteListModal, setDeleteListModal] = useState(false);
    const [listToDelete, setListToDelete] = useState<{ id: string, shared: boolean }>();
    const router = useRouter();

    function linkFromID(id: string, edit: boolean): string {
        const baseUrl = window.location.origin;
        const param = edit ? `owner=${id}` : `share=${id}`;
        return id ? `${baseUrl}?${param}` : "";
    }

    function addToClipboard(text: string) {
        navigator.clipboard.writeText(text).then(() => alert("Copied to clipboard!"))
    }

    function handleAddList() {
        setAddListModal(true);
    }

    function updateLists() {
        if (session && session.user.email) {
            getUserListInfo(session.user.email).then((info) => {
                setLists(info);
            })
            getUserSharedListInfo(session.user.email).then((info) => {
                setSharedLists(info);
            })
        }
    }

    useEffect(() => {
        updateLists();
    }, [])

    function handleLogout() {
        window.location.href = "auth/logout"
    }

    function handleDeleteList(ownerID: string, shared: boolean = false) {
        setListToDelete({id: ownerID, shared});
        setDeleteListModal(true);
    }

    function removeList() {
        if (!listToDelete) {
            return;
        }
        if (listToDelete.shared) {
            if (session && session.user.email) {
                removeSharedList(listToDelete.id, session.user.email);
                setSharedLists(sharedLists.filter(list => list.shareID !== listToDelete.id));
            }
        } else {
            deleteList(listToDelete.id);
            setLists(lists.filter(list => list.ownerID !== listToDelete.id));
        }
    }

    return (
        <div>
            <div
                className={`m-2 px-4 sm:px-6 md:px-8 flex flex-col items-center transition-all duration-100 ${deleteListModal || addListModal ? "blur-xs" : ""}`}>
                <div className={"w-full max-w-4xl space-y-1.5"}>
                    <div className={"space-y-5 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                        <div className={"flex justify-between"}>
                            <h1 className={"text-4xl"}>Welcome, {session?.user.name}</h1>
                            <ListButton buttonText={"Log Out"} onClick={() => handleLogout()}></ListButton>
                        </div>
                        <h1 className={"text-3xl"}>User Info</h1>
                        <div className={"b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                            <h2><strong>Email:</strong> {session?.user.email}</h2>

                        </div>
                        <div className="flex gap-4">
                            {/* Left Panel */}
                            <div className="flex-1 min-h-0">
                                <h1 className="text-3xl">Your Lists</h1>
                                <div
                                    className="b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300 h-108 overflow-y-auto space-y-2">
                                    {lists.length > 0 ? (
                                        lists.map((list) => (
                                            <div
                                                className={"flex justify-between b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}
                                                key={list.ownerID}>
                                                <div><h2 className={"text-2xl"}><strong>{list.listName}</strong></h2>
                                                    <h2><a
                                                        onClick={() => addToClipboard(linkFromID(list.ownerID, true))}
                                                        className={"cursor-pointer text-gray-800 hover:text-orange-400"}><strong>Copy
                                                        Edit Link</strong></a></h2> <h2><a
                                                        onClick={() => addToClipboard(linkFromID(list.shareID, false))}
                                                        className={"cursor-pointer text-gray-800 hover:text-orange-400"}><strong>Copy
                                                        Share Link</strong></a></h2></div>
                                                <ListButton onClick={() => router.push(linkFromID(list.ownerID, true))}
                                                            buttonText={"Go To List"}></ListButton> <ListButton
                                                onClick={() => handleDeleteList(list.ownerID)}
                                                buttonIcon={<FaTrashCan/>}></ListButton></div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600 italic">No lists yet.</p>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel */}
                            <div className="flex-1 min-h-0">
                                <h1 className="text-3xl">Lists shared with you</h1>
                                <div
                                    className="b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300 h-108 overflow-y-auto space-y-2">
                                    {sharedLists.length > 0 ? (
                                        sharedLists.map((list) => (
                                            <div
                                                className={"flex justify-between b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}
                                                key={list.shareID}>
                                                <div><h2 className={"text-2xl"}><strong>{list.sharedListName}</strong>
                                                </h2> <h2><a
                                                    onClick={() => addToClipboard(linkFromID(list.shareID, false))}
                                                    className={"cursor-pointer text-gray-800 hover:text-orange-400"}><strong>Copy
                                                    Share Link</strong></a></h2></div>
                                                <ListButton onClick={() => router.push(linkFromID(list.shareID, false))}
                                                            buttonText={"Go To List"}></ListButton> <ListButton
                                                onClick={() => handleDeleteList(list.shareID, true)}
                                                buttonIcon={<FaTrashCan/>}></ListButton></div>
                                        ))
                                    ) : (
                                        <p className="text-gray-600 italic">No shared lists.</p>
                                    )}
                                </div>
                            </div>
                        </div>

                        <ListButton onClick={() => handleAddList()} buttonText={"Add List"}></ListButton>
                    </div>
                </div>

            </div>
            <div id={"modal"}></div>
            {addListModal && <Modal modalTitle={"Add List"} modalDivID={"modal"} showModalToggle={setAddListModal}
                                    modalBody={<ListModal session={session} setAddListModal={setAddListModal}
                                                          updateLists={updateLists}/>}></Modal>}
            {deleteListModal &&
                <Modal modalTitle={"Delete List?"} modalDivID={"modal"} showModalToggle={setDeleteListModal}
                       modalBody={<WarningModal warning={"Are you sure you want to delete this list?"}
                                                toggleModal={setDeleteListModal}
                                                actionFunction={removeList}/>}></Modal>}
        </div>
    );
}