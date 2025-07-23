import {Item} from "../database/SaveList";
import {FaPencil, FaTrashCan} from "react-icons/fa6";
import ListButton from "./ListButton";
import ListInput from "./ListInput";
import {useState} from "react";

export interface ItemElementProps {
    item: Item;
    editItem?: (itemID: number) => void;
    deleteItem?: (itemID: number) => void;
    updatePurchaseCount?: (itemID: number | undefined, quantity: number) => void;
}


const ItemElement = ({item, editItem, deleteItem, updatePurchaseCount}: ItemElementProps) => {
    const [localQuantityPurchased, setLocalQuantityPurchased] = useState(item.itemQuantityPurchased);

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }
    return (
        <>
            <div className={"bg-gray-400 rounded-lg p-2 my-2"}>
                <div className={"flex justify-between items-center"}>
                <span className={"text-gray-800"}>
                    <div className={"text-wrap w-50"}>{item.itemName}</div>
                    {editItem ? (
                        <div>Quantity: {item.itemQuantity}</div>
                    ):
                        (
                            <div>
                                <h2>Purchased:</h2>
                                <div className={"flex"}>
                                    <ListInput className={"text-center w-10"} label={""} type={"number"} value={localQuantityPurchased} min={item.itemQuantityPurchased} max={item.itemQuantity} onChange={(e) => {setLocalQuantityPurchased(clamp(Number(e.target.value), item.itemQuantityPurchased || 0, item.itemQuantity)); updatePurchaseCount?.(item.itemID, clamp(Number(e.target.value), item.itemQuantityPurchased || 0, item.itemQuantity))}}/>
                                    <h2 className={"px-1 text-xl"}>of {item.itemQuantity}</h2>
                                </div>
                            </div>
                        )}
                    <h2><a className={"text-orange-600 hover:text-orange-500"} target={"_blank"} rel="noopener noreferrer" href={item.itemLink}>Link to Purchase</a></h2>
                    <h2>Description:</h2>
                    <p className={"text-wrap w-50"}>{item.itemDescription}</p>
                </span>
                    <img className={"w-[100px] h-auto object-contain"} width={100} src={item.itemImageURL || ""} alt={"Image of Item"}></img>
                    {editItem && (
                        <div className={"space-x-1.5"}>
                            <ListButton onClick={() => {if(item.itemID)editItem?.(item.itemID)}} buttonIcon={<FaPencil />}/>
                            <ListButton onClick={() => {if(item.itemID)deleteItem?.(item.itemID)}} buttonIcon={<FaTrashCan />}/>
                        </div>
                    )}
                </div>
            </div>

        </>
    )
}

export default ItemElement;

