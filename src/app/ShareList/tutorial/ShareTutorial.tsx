"use client"
import ListButton from "@/app/elements/ListButton";
import {useEffect, useState} from "react";

interface TutorialProps {
    actionFunction?: () => void;
    toggleModal: (toggle: boolean) => void;
    state: TutorialState;
    setState: (state: TutorialState) => void;
}

interface TutorialObjectProps {
    state: TutorialState;
    setState: (state: TutorialState) => void;
}

export enum TutorialState {
    TUTORIAL_START,
    PURCHASE_LINK,
    MARK_FOR_PURCHASE,
    LISTED_PURCHASES,
    CONFIRM_PURCHASES,
    PURCHASE_DISCLAIMER
}

export default function ShareTutorial(props: TutorialProps){
    switch (props.state){
        case TutorialState.TUTORIAL_START:
            return <Start state={props.state} setState={props.setState} actionFunction={props.actionFunction} toggleModal={props.toggleModal} />
        case TutorialState.PURCHASE_LINK:
            return <PurchaseLink state={props.state} setState={props.setState} />
        case TutorialState.MARK_FOR_PURCHASE:
            return <MarkForPurchase state={props.state} setState={props.setState} />
        case TutorialState.LISTED_PURCHASES:
            return <ListedPurchases state={props.state} setState={props.setState} />
        case TutorialState.CONFIRM_PURCHASES:
            return <ConfirmPurchases state={props.state} setState={props.setState} />
        case TutorialState.PURCHASE_DISCLAIMER:
            return <PurchaseDisclaimer actionFunction={props.actionFunction} toggleModal={props.toggleModal} state={props.state} setState={props.setState} />
    }
}

const Start = (props: TutorialProps) => {
    return (
        <>
            <div className={"space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <h1 className={"text-xl lg:text-2xl"}>Would you like to do the purchasing tutorial?</h1>
                <div className={"space-x-3"}>
                    <ListButton buttonText={"Yes"} onClick={() => { props.setState(props.state + 1)}}></ListButton>
                    <ListButton buttonText={"No"} onClick={() => {  props.actionFunction?.(); props.toggleModal(false); }}></ListButton>
                </div>
            </div>
        </>
    )
}

const PurchaseLink = (props: TutorialObjectProps) => {
    return (
        <>
            <div className={"space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <h1 className={"text-xl lg:text-2xl"}>Clicking on Link to Purchase will bring you to the website where the list owner wants their item from. </h1>
                <div className={"space-x-3"}>
                    <ListButton buttonText={"Next"} onClick={() => { props.setState(props.state + 1)}}></ListButton>
                </div>
            </div>
        </>
    )
}

const MarkForPurchase = (props: TutorialObjectProps) => {
    const [positionWord, setPositionWord] = useState("bottom");
    useEffect(() => {
        const isMobile = window.innerWidth < 640;
        setPositionWord(isMobile ? "bottom" : "right");
    }, []);
    return (
        <>
            <div className={"space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <h1 className={"text-xl lg:text-2xl"}>{`Clicking this checkbox will add the item to your list of purchases displayed on the ${positionWord}. If the list owner has requested multiple of this item, an additional box will appear to specify the number you are purchasing.`}</h1>
                <div className={"space-x-3"}>
                    <ListButton buttonText={"Next"} onClick={() => { props.setState(props.state + 1)}}></ListButton>
                </div>
            </div>
        </>
    )
}

const ListedPurchases = (props: TutorialObjectProps) => {
    return (
        <>
            <div className={"space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <h1 className={"text-xl lg:text-2xl"}>After you mark an item as purchased, it will appear here so you can easily see which items you have selected to purchase</h1>
                <h1 className={"text-xl lg:text-2xl"}>**Note at this point no items have been saved as purchased**</h1>
                <div className={"space-x-3"}>
                    <ListButton buttonText={"Next"} onClick={() => { props.setState(props.state + 1)}}></ListButton>
                </div>
            </div>
        </>
    )
}

const ConfirmPurchases = (props: TutorialObjectProps) => {
    return (
        <>
            <div className={"space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <h1 className={"text-xl lg:text-2xl"}>Clicking the Confirm Purchases button will properly save the items you have purchased and remove them from this list and not be shown to others.</h1>
                <h1 className={"text-xl lg:text-2xl"}>Note that the list owner is not notified of these purchases.</h1>
                <div className={"space-x-3"}>
                    <ListButton buttonText={"Next"} onClick={() => { props.setState(props.state + 1)}}></ListButton>
                </div>
            </div>
        </>
    )
}

const PurchaseDisclaimer = (props: TutorialProps) => {
    return (
        <>
            <div className={"space-y-2 b-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300"}>
                <h1 className={"text-xl lg:text-2xl"}>**Disclaimer** </h1>
                <h1 className={"text-xl lg:text-2xl"}>Pressing Confirm Purchases on this site DO NOT actually purchase any items. This must be done on the respective sites provided by the list owner.</h1>
                <div className={"space-x-3"}>
                    <ListButton buttonText={"Close"} onClick={() => { props.actionFunction?.(); props.toggleModal(false);}}></ListButton>
                </div>
            </div>
        </>
    )
}