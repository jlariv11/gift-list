"use client";

import { useContext, useEffect, useState } from "react";
import { SessionContext } from "../SessionContext";
import ListButton from "../elements/ListButton";
import Modal from "../components/Modal";
import ListInput from "../elements/ListInput";
import {addUserToList, addUserToSharedList, getUserListInfo, getUserSharedListInfo} from "../database/UserLists";
import { SessionData } from "@auth0/nextjs-auth0/types";
import {FaArrowRight, FaLink, FaPlus, FaTrashCan, FaUserGroup} from "react-icons/fa6";
import {deleteList, removeSharedList} from "../database/SaveList";
import WarningModal from "../components/WarningModal";
import { useRouter } from "next/navigation";
import {getAccessToken, hasAccessToken} from "@/app/Helper";

interface ListProps {
    ownerID: string;
    shareID: string;
    listName: string;
}

interface SharedListProps {
    sharedListName: string;
    shareID: string;
}

type ListModalProps = {
    updateLists: () => void;
    setAddListModal: (modalToggle: boolean) => void;
};

const ListModal = ({updateLists, setAddListModal}: ListModalProps) => {
    const [link, setLink] = useState("");

    function submit() {
        if (link.includes("owner")) {
            addUserToList(link).then(() => {
                updateLists();
                setAddListModal(false);
            });
        } else if (link.includes("share")) {
            addUserToSharedList(link).then(() => {
                updateLists();
                setAddListModal(false);
            });
        }
    }

    return (
        <div className="space-y-5">
            <div>
                <p className="mb-4 text-sm leading-6 text-muted">
                    Paste an edit or share link to add an existing list
                    to your account.
                </p>

                <ListInput
                    type="text"
                    value={link}
                    label="List link"
                    placeholder="Paste a Gift List link..."
                    onChange={(e) => setLink(e.target.value)}
                />
            </div>

            <div className="flex justify-end gap-3 border-t border-border pt-5">
                <ListButton
                    variant="ghost"
                    buttonText="Cancel"
                    onClick={() => setAddListModal(false)}
                />

                <ListButton
                    buttonText="Add list"
                    onClick={submit}
                />
            </div>
        </div>
    );
};

export default function AccountPage() {
    const [accessToken, setHasAccessToken] = useState(false);

    const [lists, setLists] = useState<ListProps[]>([]);
    const [sharedLists, setSharedLists] = useState<SharedListProps[]>([]);

    const [addListModal, setAddListModal] = useState(false);
    const [deleteListModal, setDeleteListModal] = useState(false);

    const [listToDelete, setListToDelete] = useState<{
        id: string;
        shared: boolean;
    }>();

    const router = useRouter();

    useEffect(() => {
        hasAccessToken().then(hasToken => {
            if(hasToken){
                setHasAccessToken(hasToken);
                updateLists();
            }
        })
    }, []);

    function linkFromID(id: string, edit: boolean): string {
        const baseUrl = window.location.origin;
        const param = edit ? `owner=${id}` : `share=${id}`;

        return id ? `${baseUrl}?${param}` : "";
    }

    function addToClipboard(text: string) {
        navigator.clipboard.writeText(text);
    }

    function updateLists() {
        getUserListInfo().then((info) => {
            setLists(info);
        });

        getUserSharedListInfo().then((info) => {
            setSharedLists(info);
        });

    }

    function handleLogout() {
        window.location.href = "auth/logout";
    }

    function handleDeleteList(
        ownerID: string,
        shared: boolean = false
    ) {
        setListToDelete({
            id: ownerID,
            shared
        });

        setDeleteListModal(true);
    }

    function removeList() {
        if (!listToDelete) {
            return;
        }

        if (listToDelete.shared) {
            if (accessToken) {
                removeSharedList(
                    listToDelete.id,
                );

                setSharedLists(
                    sharedLists.filter(
                        (list) =>
                            list.shareID !== listToDelete.id
                    )
                );
            }
        } else {
            deleteList(listToDelete.id);

            setLists(
                lists.filter(
                    (list) =>
                        list.ownerID !== listToDelete.id
                )
            );
        }
    }

    const modalOpen =
        deleteListModal || addListModal;

    return (
        <>
            <main
                className={`
                    min-h-screen
                    bg-page
                    transition
                    duration-150
                    ${modalOpen ? "blur-[1px]" : ""}
                `}
            >
                <div
                    className="
                        mx-auto
                        w-full
                        max-w-5xl
                        px-4
                        py-8
                        sm:px-6
                        sm:py-12
                        lg:px-8
                    "
                >

                    {/* Account header */}
                    <header
                        className="
                            mb-10
                            flex
                            flex-col
                            gap-5
                            border-b
                            border-border
                            pb-8
                            sm:flex-row
                            sm:items-center
                            sm:justify-between
                        "
                    >
                        <div>
                            <p className="text-sm font-medium text-muted">
                                Your account
                            </p>

                            <h1
                                className="
                                    mt-1
                                    text-3xl
                                    font-semibold
                                    tracking-tight
                                    text-foreground
                                "
                            >
                                {accessToken
                                    ? `Welcome, ${"Figure this out later"}`
                                    : "Welcome"}
                            </h1>

                            {accessToken && (
                                <p className="mt-2 text-sm text-muted">
                                    {"figure this out later"}
                                </p>
                            )}
                        </div>

                        <ListButton
                            variant="secondary"
                            buttonText="Log out"
                            onClick={handleLogout}
                        />
                    </header>

                    {/* Lists heading */}
                    <div
                        className="
                            mb-6
                            flex
                            flex-col
                            gap-4
                            sm:flex-row
                            sm:items-end
                            sm:justify-between
                        "
                    >
                        <div>
                            <h2
                                className="
                                    text-2xl
                                    font-semibold
                                    tracking-tight
                                    text-foreground
                                "
                            >
                                My lists
                            </h2>

                            <p className="mt-1 text-sm text-muted">
                                Your gift lists and lists shared with you.
                            </p>
                        </div>

                        <ListButton
                            variant="secondary"
                            buttonText="Add existing list"
                            buttonIcon={<FaPlus />}
                            onClick={() => setAddListModal(true)}
                        />
                    </div>

                    <div
                        className="
                            grid
                            grid-cols-1
                            gap-10
                            lg:grid-cols-2
                        "
                    >

                        {/* Your lists */}
                        <section>
                            <div
                                className="
                                    mb-4
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <h3
                                        className="
                                            text-lg
                                            font-semibold
                                            text-foreground
                                        "
                                    >
                                        Your lists
                                    </h3>

                                    <p className="mt-1 text-xs text-muted">
                                        Lists you can edit and manage.
                                    </p>
                                </div>

                                <span
                                    className="
                                        rounded-full
                                        bg-primary-light
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        text-primary
                                    "
                                >
                                    {lists.length}
                                </span>
                            </div>

                            {lists.length > 0 ? (
                                <div className="space-y-3">
                                    {lists.map((list) => (
                                        <div
                                            key={list.ownerID}
                                            className="
                                                group
                                                rounded-xl
                                                border
                                                border-border
                                                bg-surface
                                                p-5
                                                transition
                                                hover:border-[#D8D8D2]
                                                hover:shadow-sm
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-4
                                                "
                                            >
                                                <div className="min-w-0">
                                                    <h4
                                                        className="
                                                            truncate
                                                            text-base
                                                            font-semibold
                                                            text-foreground
                                                            cursor-default
                                                        "
                                                    >
                                                        {list.listName}
                                                    </h4>

                                                    <p
                                                        className="
                                                            mt-1
                                                            text-xs
                                                            text-muted
                                                            cursor-default
                                                        "
                                                    >
                                                        Your list
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    aria-label="Delete list"
                                                    onClick={() =>
                                                        handleDeleteList(
                                                            list.ownerID
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        text-muted
                                                        transition-colors
                                                        hover:bg-danger-light
                                                        hover:text-danger
                                                        cursor-pointer
                                                    "
                                                >
                                                    <FaTrashCan className="text-sm" />
                                                </button>
                                            </div>

                                            <div
                                                className="
                                                    mt-5
                                                    flex
                                                    flex-wrap
                                                    items-center
                                                    gap-x-4
                                                    gap-y-3
                                                    border-t
                                                    border-border
                                                    pt-4
                                                "
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        addToClipboard(
                                                            linkFromID(
                                                                list.ownerID,
                                                                true
                                                            )
                                                        )
                                                    }
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                        text-xs
                                                        font-medium
                                                        text-muted
                                                        transition-colors
                                                        hover:text-primary
                                                        cursor-pointer
                                                    "
                                                >
                                                    <FaLink />
                                                    Copy edit link
                                                </button>

                                                {list.shareID && (
                                                    <button
                                                        type="button"
                                                        onClick={() =>
                                                            addToClipboard(
                                                                linkFromID(
                                                                    list.shareID,
                                                                    false
                                                                )
                                                            )
                                                        }
                                                        className="
                                                            inline-flex
                                                            items-center
                                                            gap-1.5
                                                            text-xs
                                                            font-medium
                                                            text-muted
                                                            transition-colors
                                                            hover:text-primary
                                                            cursor-pointer
                                                        "
                                                    >
                                                        <FaUserGroup />
                                                        Copy share link
                                                    </button>
                                                )}

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            linkFromID(
                                                                list.ownerID,
                                                                true
                                                            )
                                                        )
                                                    }
                                                    className="
                                                        ml-auto
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        text-sm
                                                        font-medium
                                                        text-primary
                                                        transition-colors
                                                        hover:text-primary-hover
                                                        cursor-pointer
                                                    "
                                                >
                                                    Open
                                                    <FaArrowRight className="text-xs" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyListState
                                    text="You don't have any lists yet."
                                />
                            )}
                        </section>

                        {/* Shared lists */}
                        <section>
                            <div
                                className="
                                    mb-4
                                    flex
                                    items-center
                                    justify-between
                                "
                            >
                                <div>
                                    <h3
                                        className="
                                            text-lg
                                            font-semibold
                                            text-foreground
                                        "
                                    >
                                        Shared with you
                                    </h3>

                                    <p className="mt-1 text-xs text-muted">
                                        Lists from friends and family.
                                    </p>
                                </div>

                                <span
                                    className="
                                        rounded-full
                                        bg-primary-light
                                        px-2.5
                                        py-1
                                        text-xs
                                        font-medium
                                        text-primary
                                    "
                                >
                                    {sharedLists.length}
                                </span>
                            </div>

                            {sharedLists.length > 0 ? (
                                <div className="space-y-3">
                                    {sharedLists.map((list) => (
                                        <div
                                            key={list.shareID}
                                            className="
                                                rounded-xl
                                                border
                                                border-border
                                                bg-surface
                                                p-5
                                                transition
                                                hover:border-[#D8D8D2]
                                                hover:shadow-sm
                                            "
                                        >
                                            <div
                                                className="
                                                    flex
                                                    items-start
                                                    justify-between
                                                    gap-4
                                                "
                                            >
                                                <div className="min-w-0">
                                                    <h4
                                                        className="
                                                            truncate
                                                            text-base
                                                            font-semibold
                                                            text-foreground
                                                        "
                                                    >
                                                        {list.sharedListName}
                                                    </h4>

                                                    <p
                                                        className="
                                                            mt-1
                                                            text-xs
                                                            text-muted
                                                        "
                                                    >
                                                        Shared list
                                                    </p>
                                                </div>

                                                <button
                                                    type="button"
                                                    aria-label="Remove shared list"
                                                    onClick={() =>
                                                        handleDeleteList(
                                                            list.shareID,
                                                            true
                                                        )
                                                    }
                                                    className="
                                                        flex
                                                        h-8
                                                        w-8
                                                        shrink-0
                                                        items-center
                                                        justify-center
                                                        rounded-lg
                                                        text-muted
                                                        transition-colors
                                                        hover:bg-danger-light
                                                        hover:text-danger
                                                    "
                                                >
                                                    <FaTrashCan className="text-sm" />
                                                </button>
                                            </div>

                                            <div
                                                className="
                                                    mt-5
                                                    flex
                                                    items-center
                                                    gap-4
                                                    border-t
                                                    border-border
                                                    pt-4
                                                "
                                            >
                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        addToClipboard(
                                                            linkFromID(
                                                                list.shareID,
                                                                false
                                                            )
                                                        )
                                                    }
                                                    className="
                                                        inline-flex
                                                        items-center
                                                        gap-1.5
                                                        text-xs
                                                        font-medium
                                                        text-muted
                                                        transition-colors
                                                        hover:text-primary
                                                    "
                                                >
                                                    <FaLink />
                                                    Copy link
                                                </button>

                                                <button
                                                    type="button"
                                                    onClick={() =>
                                                        router.push(
                                                            linkFromID(
                                                                list.shareID,
                                                                false
                                                            )
                                                        )
                                                    }
                                                    className="
                                                        ml-auto
                                                        inline-flex
                                                        items-center
                                                        gap-2
                                                        text-sm
                                                        font-medium
                                                        text-primary
                                                        transition-colors
                                                        hover:text-primary-hover
                                                    "
                                                >
                                                    Open
                                                    <FaArrowRight className="text-xs" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyListState
                                    text="No lists have been shared with you yet."
                                />
                            )}
                        </section>
                    </div>
                </div>
            </main>

            <div id="modal" />

            {addListModal && (
                <Modal
                    modalTitle="Add an existing list"
                    modalDivID="modal"
                    showModalToggle={setAddListModal}
                    modalBody={
                        <ListModal
                            setAddListModal={setAddListModal}
                            updateLists={updateLists}
                        />
                    }
                />
            )}

            {deleteListModal && (
                <Modal
                    modalTitle={
                        listToDelete?.shared
                            ? "Remove list?"
                            : "Delete list?"
                    }
                    modalDivID="modal"
                    showModalToggle={setDeleteListModal}
                    modalBody={
                        <WarningModal
                            warning={
                                listToDelete?.shared
                                    ? "Remove this shared list from your account?"
                                    : "Are you sure you want to permanently delete this list?"
                            }
                            toggleModal={setDeleteListModal}
                            actionFunction={removeList}
                        />
                    }
                />
            )}
        </>
    );
}

function EmptyListState({ text }: { text: string }) {
    return (
        <div
            className="
                flex
                min-h-40
                items-center
                justify-center
                rounded-xl
                border
                border-dashed
                border-border
                bg-surface
                px-6
                py-10
                text-center
            "
        >
            <p className="text-sm text-muted">
                {text}
            </p>
        </div>
    );
}