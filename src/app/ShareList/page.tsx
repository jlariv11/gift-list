"use client"
import {useContext, useEffect, useRef, useState} from "react";
import {Item, saveSharedList} from "../database/SaveList";
import ListButton from "../elements/ListButton";
import {loadViewList} from "../database/LoadList";
import ItemElement from "../elements/ItemElement";
import {useSearchParams} from "next/navigation";
import WarningModal from "../components/WarningModal";
import Modal from "../components/Modal";
import {SessionContext} from "../SessionContext";
import {getCookie, setCookie} from "../Cookies";
import ShareTutorial, {TutorialState} from "./tutorial/ShareTutorial";
import {HighlightSquare} from "./tutorial/HighlightSquare";
import {FaBagShopping, FaCheck, FaGift} from "react-icons/fa6";

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
    const [showLearningModal, setShowLearningModal] = useState(false);
    const searchParams = useSearchParams();
    const [hasCompletedShareTutorial, setHasCompletedShareTutorial] = useState(false);
    const [state, setState] = useState(TutorialState.TUTORIAL_START);
    const [tutorialModalPosition, setTutorialModalPosition] = useState<"top" | "bottom" | "left" | "right" | "">("");

    const [purchaseResetKey, setPurchaseResetKey] = useState(0);

    const listRef = useRef<HTMLDivElement>(null);
    const confirmPurchasesRef = useRef<HTMLButtonElement>(null);


    async function fetchList(shareID: string) {
        const listData = await loadViewList(shareID);
        setListName(listData.listName);
        setItems(listData.items);
        setShareID(listData.shareID);
        const doneTutorial = getCookie("ShareTutorial") !== null;
        setHasCompletedShareTutorial(doneTutorial);
        if (!doneTutorial) {
            setShowLearningModal(true);
        }
    }

    useEffect(() => {
        const shareID = searchParams?.get("share");
        if (shareID) {
            fetchList(shareID);
        }
    }, [])

    useEffect(() => {
        const isMobile = window.innerWidth < 640;
        switch (state) {
            case TutorialState.PURCHASE_LINK:
                setTutorialModalPosition(isMobile ? "bottom" : "right")
                break;
            case TutorialState.MARK_FOR_PURCHASE:
                setTutorialModalPosition(isMobile ? "bottom" : "right")
                break;
            case TutorialState.CONFIRM_PURCHASES:
                setTutorialModalPosition(isMobile ? "" : "left");
                break;
            case TutorialState.LISTED_PURCHASES:
                setTutorialModalPosition(isMobile ? "" : "left");
                break;
            default:
                setTutorialModalPosition("");
        }
    }, [state]);

    function updatePurchaseCount(itemID: number | undefined, quantity: number) {
        const item = items.find(i => i.itemID === itemID);
        if (!item) return;

        const availableQuantity = Math.max(
            0,
            item.itemQuantity - (item.itemQuantityPurchased ?? 0)
        );

        const newQuantity = Math.max(
            0,
            Math.min(quantity, availableQuantity)
        );

        setPurchasedItems(prev => {
            if (newQuantity === 0) {
                return prev.filter(i => i.itemID !== itemID);
            }

            const existing = prev.find(i => i.itemID === itemID);

            if (existing) {
                return prev.map(i => i.itemID === itemID ? { ...i, itemQuantityPurchased: newQuantity } : i);
            }

            return [
                ...prev,
                {
                    itemID: item.itemID,
                    itemName: item.itemName,
                    itemQuantityPurchased: newQuantity
                }
            ];
        });

        if (newQuantity > 0 && !hasCompletedShareTutorial) {
            setShowLearningModal(true);
        }
    }

    async function saveItems() {
        const updatedItems = items.map(item => {
            const purchasedItem = purchasedItems.find(i => i.itemID === item.itemID);

            if (!purchasedItem) return item;

            return {
                ...item,
                itemQuantityPurchased:
                    (item.itemQuantityPurchased || 0) +
                    purchasedItem.itemQuantityPurchased
            };
        });

        await saveSharedList({
            listName,
            ownerID: "",
            shareID,
            items: updatedItems
        });

        setItems(updatedItems);
        setPurchasedItems([]);
        setShowModal(false);
        setPurchaseResetKey(prev => prev + 1);
    }


    return (
        <>
            <main
                className={`min-h-screen bg-page transition duration-150 ${
                    showModal ? "blur-[1px]" : ""
                }`}
            >
                <div className="mx-auto w-full max-w-5xl px-4 py-8 sm:px-6 sm:py-12 lg:px-8">

                    {/* Header */}
                    <header className="mb-8">
                        <p className="mb-1 text-sm font-medium text-muted">
                            Shared gift list
                        </p>

                        <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
                            {listName || "Gift List"}
                        </h1>

                        <p className="mt-2 text-sm text-muted">
                            Browse the gifts below and mark anything
                            you'd like to purchase.
                        </p>
                    </header>

                    {/* Gifts and purchases */}
                    <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-3">

                        {/* Available gifts */}
                        <section className="lg:col-span-2">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-lg font-semibold text-foreground">
                                    Available gifts
                                </h2>

                                <span className="text-sm text-muted">
                                {items.filter(
                                    i => i.itemQuantity > (i.itemQuantityPurchased || 0)
                                ).length} remaining
                            </span>
                            </div>

                            {items.some(
                                i => i.itemQuantity > (i.itemQuantityPurchased || 0)
                            ) ? (
                                <div className="space-y-3">
                                    {items
                                        .filter(
                                            i => i.itemQuantity > (i.itemQuantityPurchased || 0)
                                        )
                                        .map((item, idx) => (
                                            <ItemElement
                                                key={`${item.itemID}-${purchaseResetKey}`}
                                                item={item}
                                                shareTutorialState={
                                                    idx === 0 ? state : undefined
                                                }
                                                updatePurchaseCount={updatePurchaseCount}
                                            />
                                        ))}
                                </div>
                            ) : (
                                <div
                                    className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border bg-surface px-6 py-16 text-center">
                                    <div
                                        className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary-light text-primary">
                                        <FaGift/>
                                    </div>

                                    <h3 className="text-base font-medium text-foreground">
                                        No gifts available
                                    </h3>

                                    <p className="mt-1 max-w-sm text-sm leading-6 text-muted">
                                        There are no available gifts on this list right now.
                                    </p>
                                </div>
                            )}
                        </section>

                        {/* Purchases */}
                        <section
                            ref={listRef}
                            className="rounded-xl border border-border bg-surface p-5 sm:p-6 lg:sticky lg:top-6"
                        >
                            <div className="mb-5 flex items-center gap-3">
                                <div
                                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary-light text-primary">
                                    <FaBagShopping className="text-sm"/>
                                </div>

                                <div>
                                    <h2 className="text-lg font-semibold text-foreground">
                                        Your purchases
                                    </h2>

                                    <p className="mt-0.5 text-xs text-muted">
                                        {purchasedItems.length} selected
                                    </p>
                                </div>
                            </div>

                            {purchasedItems.length > 0 ? (
                                <div className="mb-6 divide-y divide-border">
                                    {purchasedItems.map(item => (
                                        <div
                                            key={item.itemID}
                                            className="flex items-center justify-between gap-3 py-3 first:pt-0"
                                        >
                                            <p className="text-sm font-medium text-foreground">
                                                {item.itemName}
                                            </p>

                                            <span
                                                className="shrink-0 rounded-md bg-primary-light px-2.5 py-1 text-xs font-medium text-primary">
                                            × {item.itemQuantityPurchased}
                                        </span>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div
                                    className="mb-6 rounded-lg border border-dashed border-border px-4 py-8 text-center">
                                    <p className="text-sm font-medium text-foreground">
                                        Nothing selected yet
                                    </p>

                                    <p className="mt-1 text-xs leading-5 text-muted">
                                        Select gifts from the list to add them here.
                                    </p>
                                </div>
                            )}

                            <div className="border-t border-border pt-5">
                                <ListButton
                                    ref={confirmPurchasesRef}
                                    className="w-full"
                                    buttonText="Confirm purchases"
                                    buttonIcon={<FaCheck/>}
                                    onClick={() => setShowModal(true)}
                                />

                                <p className="mt-3 text-center text-xs leading-5 text-muted">
                                    Confirming will mark these gifts as purchased
                                    so others don't buy the same ones.
                                </p>
                            </div>
                        </section>
                    </div>
                </div>
            </main>

            <div id="modal"/>

            {/* Purchase confirmation */}
            {showModal && (
                <Modal
                    modalTitle="Purchase these items?"
                    modalDivID="modal"
                    modalBody={
                        <WarningModal
                            toggleModal={setShowModal}
                            warning="This will mark these items as purchased and will make these items unavailable to purchase by others. Do you want to continue?"
                            actionFunction={saveItems}
                        />
                    }
                    showModalToggle={setShowModal}
                />
            )}

            {/* Tutorial */}
            {showLearningModal && (
                <Modal
                    ignoreBlur={true}
                    modalTitle="Tutorial"
                    modalDivID="modal"
                    showModalToggle={setShowLearningModal}
                    closeActions={() => {
                        setState(TutorialState.TUTORIAL_START);
                        setCookie("ShareTutorial", "true", 30);
                        setHasCompletedShareTutorial(true);
                    }}
                    position={tutorialModalPosition}
                    modalBody={
                        <ShareTutorial
                            state={state}
                            setState={setState}
                            toggleModal={setShowLearningModal}
                            actionFunction={() => {
                                setCookie("ShareTutorial", "true", 30);
                                setHasCompletedShareTutorial(true);
                            }}
                        />
                    }
                />
            )}

            {/* Tutorial highlights */}
            {state === TutorialState.LISTED_PURCHASES && (
                <HighlightSquare targetRef={listRef}/>
            )}

            {state === TutorialState.CONFIRM_PURCHASES && (
                <HighlightSquare targetRef={confirmPurchasesRef}/>
            )}
        </>
    );
}