import {Item} from "../database/SaveList";
import {FaPencil, FaTrashCan} from "react-icons/fa6";
import ListButton from "./ListButton";
import ListInput from "./ListInput";
import {useState} from "react";

export interface ItemElementProps extends Item {
    editItem?: (itemID: number) => void;
    deleteItem?: (itemID: number) => void;
    updatePurchaseCount?: (itemID: number | undefined, quantity: number) => void;
}


const ItemElement = ({itemID, itemName, itemQuantity, itemQuantityPurchased, itemLink, itemImage, itemDescription, editItem, deleteItem, updatePurchaseCount}: ItemElementProps) => {
    const [localQuantityPurchased, setLocalQuantityPurchased] = useState(itemQuantityPurchased);
    return (
        <>
            <div className={"bg-gray-400 rounded-lg p-2 my-2"}>
                <div className={"flex justify-between items-center"}>
                <span className={"text-gray-800"}>
                    <div>{itemName}</div>
                    {editItem ? (
                        <div>Quantity: {itemQuantity}</div>
                    ):
                        (
                            <div>Purchased: <ListInput label={""} type={"number"} value={localQuantityPurchased} min={itemQuantityPurchased} max={itemQuantity} onChange={(e) => {setLocalQuantityPurchased(Number(e.target.value)); updatePurchaseCount?.(itemID, Number(e.target.value))}}/>/{itemQuantity}</div>
                        )}
                    <h2><a className={"text-orange-600 hover:text-orange-500"} href={itemLink}>Link to Purchase</a></h2>
                    <h2>Description: {itemDescription}</h2>
                </span>
                    <img width={100} src={itemImage} alt={itemImage}></img>
                    {editItem && (
                        <div className={"space-x-1.5"}>
                            <ListButton onClick={() => {if(itemID)editItem?.(itemID)}} buttonIcon={<FaPencil />}/>
                            <ListButton onClick={() => {if(itemID)deleteItem?.(itemID)}} buttonIcon={<FaTrashCan />}/>
                        </div>
                    )}
                </div>
            </div>

        </>
    )
}

export default ItemElement;

