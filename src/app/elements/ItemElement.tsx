import {Item} from "../database/SaveList";
import {FaMinus, FaPencil, FaTrashCan} from "react-icons/fa6";
import ListButton from "./ListButton";
import ListInput from "./ListInput";
import {useRef, useState} from "react";
import {FaPlus} from "react-icons/fa";
import {TutorialState} from "@/app/ShareList/tutorial/ShareTutorial";
import {HighlightSquare} from "@/app/ShareList/tutorial/HighlightSquare";

export interface ItemElementProps {
    item: Item;
    editItem?: (itemID: number) => void;
    deleteItem?: (itemID: number) => void;
    updatePurchaseCount?: (itemID: number | undefined, quantity: number) => void;
    shareTutorialState?: TutorialState;
}


const ItemElement = ({item, editItem, deleteItem, updatePurchaseCount, shareTutorialState}: ItemElementProps) => {
    return editItem ? <EditItemElement item={item} editItem={editItem} deleteItem={deleteItem} /> : <ViewItemElement item={item} updatePurchaseCount={updatePurchaseCount} shareTutorialState={shareTutorialState} />
}


const ViewItemElement = ({item, updatePurchaseCount, shareTutorialState}: ItemElementProps) => {
    const [localQuantityPurchased, setLocalQuantityPurchased] = useState(item.itemQuantityPurchased ? item.itemQuantityPurchased : 0);
    const multiQuantityItem = item.itemQuantity > 1 || (item.itemQuantityPurchased !== undefined && item.itemQuantity - item.itemQuantityPurchased > 1);
    const [itemMarkedForPurchase, setItemMarkedForPurchase] = useState(false);
    const linkRef = useRef<HTMLAnchorElement>(null);
    const markPurchaseRef = useRef<HTMLInputElement>(null);

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    return (
        <>
            <div className="bg-gray-400 rounded-lg p-4 my-2">
                <div className={"flex items-center justify-between"}>
                    <img
                        className="border-2 rounded-lg w-[150px] h-[100px] lg:w-[250px] lg:h-[150px] object-cover"
                        src={item.itemImageURL ? item.itemImageURL : undefined}
                        alt="No Image Provided"
                    />
                    <div className="border-2 rounded-lg p-2 w-[150px] h-[100px] lg:w-[250px] lg:h-[150px]  overflow-y-scroll text-wrap">
                        {item.itemDescription.length === 0 ? "No Description" : item.itemDescription}
                    </div>
                </div>
                <div>
                    <h1 className="mt-2 font-semibold break-words text-lg">{item.itemName}</h1>

                    <div className={"flex space-x-3 items-center"}>
                        <h1>Mark Item as Purchased</h1>
                        <input
                            ref={markPurchaseRef}
                            className="text-center scale-150"
                            type="checkbox"
                            checked={itemMarkedForPurchase}
                            onChange={(e) => {
                                if(!multiQuantityItem) {
                                    const quantity = e.target.checked ? 1 : 0;
                                    setLocalQuantityPurchased(quantity);
                                    updatePurchaseCount?.(item.itemID, quantity);
                                }else {
                                    if(!e.target.checked) {
                                        const quantity = item.itemQuantityPurchased ? item.itemQuantityPurchased : 0;
                                        setLocalQuantityPurchased(quantity);
                                        updatePurchaseCount?.(item.itemID, quantity);
                                    }
                                }
                                setItemMarkedForPurchase(e.target.checked);
                            }}
                        />
                        {(itemMarkedForPurchase && multiQuantityItem) &&
                            <div className={"px-2 select-none flex items-center"}>
                                <div className={"z-10 cursor-pointer px-2"} onClick={() => {
                                    const quantity = clamp(localQuantityPurchased - 1, item.itemQuantityPurchased ? item.itemQuantityPurchased : 0, item.itemQuantity);
                                    setLocalQuantityPurchased(quantity);
                                    updatePurchaseCount?.(item.itemID, quantity);
                                }}>
                                    <FaMinus className={"text-sm"}/>
                                </div>
                                <ListInput
                                    className="text-center w-14"
                                    label=""
                                    type="number"
                                    value={localQuantityPurchased}
                                    min={item.itemQuantityPurchased}
                                    max={item.itemQuantity}
                                    onChange={(e) => {
                                        if(e.target.value == "" && localQuantityPurchased == 0){
                                            return;
                                        }
                                        setLocalQuantityPurchased(Number(e.target.value));
                                        updatePurchaseCount?.(item.itemID, Number(e.target.value));
                                    }}
                                    onBlur={(e) => {
                                        setLocalQuantityPurchased(clamp(Number(e.target.value), Number(e.target.min), Number(e.target.max)));
                                        if(e.target.value == "") {
                                            e.target.value = String(item.itemQuantityPurchased);
                                            updatePurchaseCount?.(item.itemID, Number(e.target.value));
                                        }
                                    }}
                                    onFocus={(e) => e.target.value = ""}
                                />
                                <div className={"z-10 cursor-pointer px-2"} onClick={() => {
                                    const quantity = clamp(localQuantityPurchased + 1, item.itemQuantityPurchased ? item.itemQuantityPurchased : 0, item.itemQuantity);
                                    setLocalQuantityPurchased(quantity);
                                    updatePurchaseCount?.(item.itemID, quantity);
                                }}>
                                    <FaPlus className={"text-sm"}/>
                                </div>
                            </div>
                        }
                    </div>
                    <a ref={linkRef} className="text-lg text-orange-600 hover:text-orange-500" target="_blank" rel="noopener noreferrer" href={item.itemLink}>Link to Purchase</a>
                </div>
            </div>
            {shareTutorialState === TutorialState.PURCHASE_LINK && (
                <HighlightSquare targetRef={linkRef} />
            )}
            {shareTutorialState === TutorialState.MARK_FOR_PURCHASE && (
                <HighlightSquare targetRef={markPurchaseRef} />
            )}
        </>
    )
}

const EditItemElement = ({item, editItem, deleteItem}: ItemElementProps) => {
    return (
        <>
            <div className="bg-gray-400 rounded-lg p-4 my-2">
                <div className="flex gap-4">
                    <div className="flex flex-col items-start min-w-[100px] lg:min-w-[200px]">
                        <img
                            className="border-2 rounded-lg w-[125px] h-[75px] lg:w-[200px] lg:h-[150px] object-cover"
                            src={item.itemImageURL ? item.itemImageURL : undefined}
                            alt="Image of Item"
                        />
                        <div className={"max-w-40 lg:max-w-200 "}>
                            <h1 className="mt-2 font-semibold break-words text-lg">{item.itemName}</h1>
                            <h1 className="text-lg mt-2">Quantity: {item.itemQuantity}</h1>
                        </div>

                    </div>

                    <div className="flex flex-col justify-between flex-1">
                        <div className="border-2 rounded-lg p-2 w-[150px] h-[100px] lg:w-[250px] lg:h-[150px] overflow-y-scroll text-wrap">
                            {item.itemDescription.length === 0 ? "No Description" : item.itemDescription}
                        </div>

                        <div className="flex justify-end gap-2 mt-4">
                            <ListButton
                                onClick={() => {
                                    if (item.itemID) editItem?.(item.itemID);
                                }}
                                buttonIcon={<FaPencil />}
                            />
                            <ListButton
                                onClick={() => {
                                    if (item.itemID) deleteItem?.(item.itemID);
                                }}
                                buttonIcon={<FaTrashCan />}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}


export default ItemElement;

