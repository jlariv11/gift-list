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
    return editItem ? <EditItemElement item={item} editItem={editItem} deleteItem={deleteItem} /> : <ViewItemElement item={item} updatePurchaseCount={updatePurchaseCount}/>
}


const ViewItemElement = ({item, updatePurchaseCount}: ItemElementProps) => {
    const [localQuantityPurchased, setLocalQuantityPurchased] = useState(item.itemQuantityPurchased);

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }
    return (
        <>
            <div className="bg-gray-400 rounded-lg p-4 my-2">
                <div className="flex gap-4">
                    {/* Left Column (Image + Description) */}
                    <div className="flex flex-col items-start min-w-[200px]">
                        <img
                            className="border-2 rounded-lg w-[200px] h-[150px] object-cover"
                            src={item.itemImageURL ? item.itemImageURL : undefined}
                            alt="Image of Item"
                        />
                        <div>
                            <h1 className="mt-2 font-semibold w-[200px] text-lg">{item.itemName}</h1>
                            <div className="flex items-center gap-2">
                                <ListInput
                                    className="text-center w-14"
                                    label=""
                                    type="number"
                                    value={localQuantityPurchased}
                                    min={item.itemQuantityPurchased}
                                    max={item.itemQuantity}
                                    onChange={(e) => {
                                        const val = clamp(
                                            Number(e.target.value),
                                            item.itemQuantityPurchased || 0,
                                            item.itemQuantity
                                        );
                                        setLocalQuantityPurchased(val);
                                        updatePurchaseCount?.(item.itemID, val);
                                    }}
                                />
                                <span className="text-xl">of {item.itemQuantity}</span>
                            </div>
                            <a className="text-lg text-orange-600 hover:text-orange-500" target="_blank" rel="noopener noreferrer" href={item.itemLink}>Link to Purchase</a>
                        </div>

                    </div>

                    {/* Right Column (Name, Quantity, Buttons) */}
                    <div className="flex flex-col justify-between flex-1">
                        {/* Top Section */}
                        <div className="border-2 rounded-lg p-2 h-[150px] overflow-y-scroll text-wrap">
                            {item.itemDescription.length === 0 ? "No Description" : item.itemDescription}
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}

const EditItemElement = ({item, editItem, deleteItem}: ItemElementProps) => {
    return (
        <>
            <div className="bg-gray-400 rounded-lg p-4 my-2">
                <div className="flex gap-4">
                    {/* Left Column (Image + Description) */}
                    <div className="flex flex-col items-start min-w-[200px]">
                        <img
                            className="border-2 rounded-lg w-[200px] h-[150px] object-cover"
                            src={item.itemImageURL ? item.itemImageURL : undefined}
                            alt="Image of Item"
                        />
                        <div>
                            <h1 className="mt-2 font-semibold w-[200px] text-lg">{item.itemName}</h1>
                            <h1 className="text-lg mt-2">Quantity: {item.itemQuantity}</h1>
                        </div>

                    </div>

                    {/* Right Column (Name, Quantity, Buttons) */}
                    <div className="flex flex-col justify-between flex-1">
                        {/* Top Section */}
                        <div className="border-2 rounded-lg p-2 w-[250px] h-[150px] overflow-y-scroll text-wrap">
                            {item.itemDescription.length === 0 ? "No Description" : item.itemDescription}
                        </div>

                        {/* Bottom Section (Buttons bottom-right) */}
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

