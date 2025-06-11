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
    return (
        <>
            <div className={"bg-gray-400 rounded-lg p-2 my-2"}>
                <div className={"flex justify-between items-center"}>
                <span className={"text-gray-800"}>
                    <div>{item.itemName}</div>
                    {editItem ? (
                        <div>Quantity: {item.itemQuantity}</div>
                    ):
                        (
                            <div>Purchased: <ListInput label={""} type={"number"} value={localQuantityPurchased} min={item.itemQuantityPurchased} max={item.itemQuantity} onChange={(e) => {setLocalQuantityPurchased(Number(e.target.value)); updatePurchaseCount?.(item.itemID, Number(e.target.value))}}/>/{item.itemQuantity}</div>
                        )}
                    <h2><a className={"text-orange-600 hover:text-orange-500"} href={item.itemLink}>Link to Purchase</a></h2>
                    <h2>Description:</h2>
                    <p className={"overflow-x-auto max-w-xs"}>{item.itemDescription}</p>
                </span>
                    <img width={100} src={item.itemImageURL || ""} alt={item.itemImageURL || "Image"}></img>
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

