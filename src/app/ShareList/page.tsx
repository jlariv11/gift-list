"use client"
import {useContext, useEffect, useRef, useState} from "react";
import {Item, saveSharedList} from "../database/SaveList";
import ListButton from "../elements/ListButton";
import {loadViewList} from "../database/LoadList";
import ItemElement from "../elements/ItemElement";
import {useSearchParams} from "next/navigation";
import WarningModal from "@/app/components/WarningModal";
import Modal from "@/app/components/Modal";
import {SessionContext} from "@/app/SessionContext";
import {getCookie, setCookie} from "@/app/Cookies";
import ShareTutorial, {TutorialState} from "@/app/ShareList/tutorial/ShareTutorial";
import {HighlightSquare} from "@/app/ShareList/tutorial/HighlightSquare";

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
    const session = useContext(SessionContext);
    const [hasCompletedShareTutorial, setHasCompletedShareTutorial] = useState(false);
    const [state, setState] = useState(TutorialState.TUTORIAL_START);
    const [tutorialModalPosition, setTutorialModalPosition] = useState<"top" | "bottom" | "left" | "right" | "">("");

    const listRef = useRef<HTMLDivElement>(null);
    const confirmPurchasesRef = useRef<HTMLButtonElement>(null);


    async function fetchList(shareID: string) {
        const listData = await loadViewList(shareID, session ? session.user.email : undefined);
        setListName(listData.listName);
        setItems(listData.items);
        setShareID(listData.shareID);
        const doneTutorial = getCookie("ShareTutorial") !== null;
        setHasCompletedShareTutorial(doneTutorial);
        if(!doneTutorial) {
            setShowLearningModal(true);
        }
    }

    useEffect(() => {
        const shareID = searchParams?.get("share");
        if(shareID) {
            fetchList(shareID);
        }
    }, [])

    useEffect(() => {
        const isMobile = window.innerWidth < 640;
        switch (state){
            case TutorialState.PURCHASE_LINK:
                setTutorialModalPosition(isMobile ? "bottom" : "right")
                break;
            case TutorialState.MARK_FOR_PURCHASE:
                setTutorialModalPosition(isMobile ? "bottom" : "right")
                break;
            case TutorialState.CONFIRM_PURCHASES:
                setTutorialModalPosition(isMobile ? "" :"left");
                break;
            case TutorialState.LISTED_PURCHASES:
                setTutorialModalPosition(isMobile ? "" :"left");
                break;
            default:
                setTutorialModalPosition("");
        }
    }, [state]);

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
            const newQuantity = Math.min(quantity - (item.itemQuantityPurchased || 0), item.itemQuantity);
            if(newQuantity <= 0){
                return;
            }
            const localItem = {itemID: item.itemID, itemName: item.itemName, itemQuantityPurchased: quantity - (item.itemQuantityPurchased || 0)};
            setPurchasedItems([...purchasedItems, localItem]);

            if(!hasCompletedShareTutorial){
                setShowLearningModal(true);
            }
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
                    <div className={"lg:flex gap-2"}>
                        <div className={"lg:w-2/3 h-150 overflow-y-auto border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                            {items.filter(i => i.itemQuantity !== i.itemQuantityPurchased).map((item, idx) => <ItemElement key={item.itemID} shareTutorialState={idx == 0 ? state : undefined} item={item} updatePurchaseCount={updatePurchaseCount}/>)}
                        </div>
                        <div ref={listRef} className="mt-6 lg:mt-0 lg:w-1/3 min-h-50 lg:h-150 border-4 rounded-md border-gray-400 ml-2 p-4 bg-gray-300 flex flex-col justify-between">
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
                                ref={confirmPurchasesRef}
                                onClick={() => setShowModal(true)}
                                buttonText="Confirm Purchases"
                            />
                        </div>
                    </div>
                </div>
            </div>
            <div id={"modal"}></div>
            {showModal && <Modal modalTitle={"Purchase these Items?"} modalDivID={"modal"} modalBody={<WarningModal toggleModal={setShowModal} warning={"This will mark these items as purchased and will make these items unavailable to purchase by others. Do you want to continue?"} actionFunction={saveItems} />} showModalToggle={setShowModal} />}
            {showLearningModal &&
                <Modal
                    modalTitle={"Tutorial"}
                    modalDivID={"modal"}
                    showModalToggle={setShowLearningModal}
                    closeActions={() => {setState(TutorialState.TUTORIAL_START); setCookie("ShareTutorial", "true", 30); setHasCompletedShareTutorial(true)}}
                    position={tutorialModalPosition}
                    modalBody={
                    <ShareTutorial
                        state={state}
                        setState={setState}
                        toggleModal={setShowLearningModal}
                        actionFunction={() => {setCookie("ShareTutorial", "true", 30); setHasCompletedShareTutorial(true);}}
                    />
                    }
                />
            }

            {state === TutorialState.LISTED_PURCHASES && (
                <HighlightSquare targetRef={listRef} />
            )}
            {state === TutorialState.CONFIRM_PURCHASES && (
                <HighlightSquare targetRef={confirmPurchasesRef} />
            )}
        </div>
    )
}