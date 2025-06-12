"use client"
import {SessionContext} from "../SessionContext";
import {useContext, useEffect, useState} from "react";
import ListButton from "@/app/elements/ListButton";
import Modal from "@/app/components/Modal";
import ListInput from "@/app/elements/ListInput";
import {addUserToList, getUserListInfo} from "@/app/database/UserLists";
import {SessionData} from "@auth0/nextjs-auth0/types";
import {FaTrashCan} from "react-icons/fa6";
import {deleteList} from "@/app/database/SaveList";
import DeleteModal from "@/app/components/DeleteConfirmation";
import {useRouter} from "next/navigation";

interface ListProps {
    ownerID: string;
    shareID: string;
    listName: string;
}
type ListModalProps = {
    session: SessionData | null;
    updateLists: () => void;
    setAddListModal: (modalToggle: boolean) => void
}

const ListModal = (props: ListModalProps) => {
    const [link, setLink] = useState("");
    function submit(){
        if(props.session && props.session.user.email) {
            addUserToList(link, props.session.user.email).then(() => {
                props.updateLists();
                props.setAddListModal(false);
            })
        }
    }
    return (
        <div>
            <div className={"w-100 space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <ListInput type={"text"} value={link} label={"Edit Link:"} onChange={(e) => setLink(e.target.value)}></ListInput>
                <ListButton buttonText={"Submit"} onClick={() => submit()}></ListButton>
            </div>
        </div>
    )
}

export default function AccountPage() {

    const session = useContext(SessionContext);
    const [lists, setLists] = useState<ListProps[]>([]);
    const [addListModal, setAddListModal] = useState(false);
    const [deleteListModal, setDeleteListModal] = useState(false);
    const [listToDelete, setListToDelete] = useState<string | null>(null);
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

    function updateLists(){
        if(session && session.user.email) {
            getUserListInfo(session.user.email).then((info) => {
                setLists(info);
            })
        }
    }

    useEffect(() => {
        updateLists();
    }, [])

    function handleLogout(){
        window.location.href = "auth/logout"
    }

    function handleDeleteList(ownerID: string){
        setListToDelete(ownerID);
        setDeleteListModal(true);
    }

    function removeList(){
        if(!listToDelete){
            return;
        }
        deleteList(listToDelete);
        setLists(lists.filter(list => list.ownerID !== listToDelete));
    }

    return (
        <div>
            <div className={`m-2 flex flex-col items-center transition-all duration-100 ${deleteListModal || addListModal ? "blur-xs" : ""}`}>
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
                        <h1 className={"text-3xl"}>Lists</h1>
                        <div className={"b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300 h-108 overflow-y-auto space-y-2"}>
                            {lists.map((list, index) => (
                                <div className={"flex justify-between b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"} key={index}>
                                    <div>
                                        <h2 className={"text-2xl"}><strong>{list.listName}</strong></h2>
                                        <h2><strong>Owner Link:</strong> <a onClick={() => addToClipboard(linkFromID(list.ownerID, true))} className={"cursor-pointer text-gray-800 hover:text-orange-400"}>{linkFromID(list.ownerID, true)}</a></h2>
                                        <h2><strong>Share Link:</strong> <a onClick={() => addToClipboard(linkFromID(list.shareID, false))} className={"cursor-pointer text-gray-800 hover:text-orange-400"}>{linkFromID(list.shareID, false)}</a></h2>
                                    </div>
                                    <ListButton onClick={() => router.push(linkFromID(list.ownerID, true))} buttonText={"Go To List"}></ListButton>
                                    <ListButton onClick={() => handleDeleteList(list.ownerID)} buttonIcon={<FaTrashCan />}></ListButton>
                                </div>
                            ))}
                        </div>
                        <ListButton onClick={() => handleAddList()} buttonText={"Add List"}></ListButton>
                    </div>
                </div>

            </div>
            <div id={"modal"}></div>
            {addListModal && <Modal modalTitle={"Add List"} modalDivID={"modal"} showModalToggle={setAddListModal} modalBody={<ListModal session={session} setAddListModal={setAddListModal} updateLists={updateLists}/>}></Modal>}
            {deleteListModal && <Modal modalTitle={"Delete List?"} modalDivID={"modal"} showModalToggle={setDeleteListModal} modalBody={<DeleteModal toggleModal={setDeleteListModal} deleteFunction={removeList}/>}></Modal>}
        </div>
    );
}