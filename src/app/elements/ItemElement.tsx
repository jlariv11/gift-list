import {Item} from "../database/SaveList";
import {FaPencil, FaTrashCan} from "react-icons/fa6";
import ListButton from "./ListButton";
import ListInput from "./ListInput";
import {useState} from "react";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";

export interface ItemElementProps {
    items: Item[];
    editItem?: (itemID: number) => void;
    deleteItem?: (itemID: number) => void;
    updatePurchaseCount?: (itemID: number | undefined, quantity: number) => void;
}


const ItemElement = ({items, editItem, deleteItem, updatePurchaseCount}: ItemElementProps) => {
    const [itemIndex, setItemIndex] = useState(0);
    const [currentItem, setCurrentItem] = useState(items[itemIndex]);
    const [localQuantityPurchased, setLocalQuantityPurchased] = useState(currentItem.itemQuantityPurchased);

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    function switchItem(direction: -1 | 1){
        if(itemIndex + direction >= items.length || itemIndex + direction < 0){
            return;
        }
        setItemIndex(itemIndex + direction);
        setCurrentItem(items[itemIndex + direction]);
    }

    return (
        <>
            <div className={"bg-gray-400 rounded-lg p-2 my-2"}>
                <div className={"flex justify-between items-center"}>
                <span className={"text-gray-800"}>
                    <div className={"text-wrap w-50"}>{currentItem.itemName}</div>
                    {editItem ? (
                        <div>Quantity: {currentItem.itemQuantity}</div>
                    ):
                        (
                            <div>
                                <h2>Purchased:</h2>
                                <div className={"flex"}>
                                    <ListInput className={"text-center w-10"} label={""} type={"number"} value={localQuantityPurchased} min={currentItem.itemQuantityPurchased} max={item.itemQuantity} onChange={(e) => {setLocalQuantityPurchased(clamp(Number(e.target.value), currentItem.itemQuantityPurchased || 0, currentItem.itemQuantity)); updatePurchaseCount?.(currentItem.itemID, clamp(Number(e.target.value), currentItem.itemQuantityPurchased || 0, currentItem.itemQuantity))}}/>
                                    <h2 className={"px-1 text-xl"}>of {currentItem.itemQuantity}</h2>
                                </div>
                            </div>
                        )}
                    <h2><a className={"text-orange-600 hover:text-orange-500"} target={"_blank"} rel="noopener noreferrer" href={currentItem.itemLink}>Link to Purchase</a></h2>
                    <h2>Description:</h2>
                    <p className={"text-wrap w-50"}>{currentItem.itemDescription}</p>
                </span>
                    <img className={"w-[100px] h-auto object-contain"} width={100} src={currentItem.itemImageURL || null} alt={"Image of Item"}></img>
                    {editItem && (
                        <div className={"space-x-1.5"}>
                            <ListButton onClick={() => {if(items[0].itemID)editItem?.(items[0].itemID)}} buttonIcon={<FaPencil />}/>
                            <ListButton onClick={() => {if(items[0].itemID)deleteItem?.(items[0].itemID)}} buttonIcon={<FaTrashCan />}/>
                            <ListButton onClick={() => switchItem(-1)} buttonIcon={<FaArrowLeft />}/>
                            <ListButton onClick={() => switchItem(1)} buttonIcon={<FaArrowRight />}/>
                        </div>
                    )}
                </div>
            </div>

        </>
    )
}

export default ItemElement;

