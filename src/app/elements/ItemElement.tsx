import {Item} from "../database/SaveList";
import {FaPencil, FaQuestion, FaTrashCan} from "react-icons/fa6";
import ListButton from "./ListButton";
import ListInput from "./ListInput";
import {useState} from "react";
import {FaArrowLeft, FaArrowRight} from "react-icons/fa";
import Image from "next/image";

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
        <div className="p-2 bg-gray-400 rounded-lg p-2 my-2">
            <div className="flex justify-between items-start flex-wrap gap-4">
                {/* Left content */}
                <div className="text-gray-800 w-full sm:w-1/2 flex flex-col gap-2">
                    <div className="font-semibold text-lg break-words">{currentItem.itemName}</div>

                    {editItem ? (
                        <div>Quantity: {currentItem.itemQuantity}</div>
                    ) : (
                        <div>
                            <h2>Purchased:</h2>
                            <div className="flex items-center gap-2">
                                <ListInput
                                    className="text-center w-14"
                                    label=""
                                    type="number"
                                    value={localQuantityPurchased}
                                    min={currentItem.itemQuantityPurchased}
                                    max={currentItem.itemQuantity}
                                    onChange={(e) => {
                                        const val = clamp(
                                            Number(e.target.value),
                                            currentItem.itemQuantityPurchased || 0,
                                            currentItem.itemQuantity
                                        );
                                        setLocalQuantityPurchased(val);
                                        updatePurchaseCount?.(currentItem.itemID, val);
                                    }}
                                />
                                <span className="text-xl">of {currentItem.itemQuantity}</span>
                            </div>
                        </div>
                    )}

                    <div>
                        <h2>
                            <a
                                className="text-orange-600 hover:text-orange-500"
                                target="_blank"
                                rel="noopener noreferrer"
                                href={currentItem.itemLink}
                            >
                                Link to Purchase
                            </a>
                        </h2>
                    </div>

                    <div>
                        <h2>Description:</h2>
                        <p className="whitespace-normal break-words max-h-32 overflow-y-auto">
                            {currentItem.itemDescription}
                        </p>
                    </div>
                </div>

                {/* Right content */}
                <div className="flex flex-col items-center gap-2 w-full sm:w-auto">
                    {currentItem.itemImageURL ? (
                        <div className="w-full max-w-[300px]">
                            <Image
                                src={currentItem.itemImageURL}
                                alt="Image of Item"
                                width={300}
                                height={300}
                                className="object-contain w-full h-auto"
                            />
                        </div>
                    ) : (
                        <FaQuestion title={"No Image Provided"} className="text-4xl text-gray-600" />
                    )}

                    {editItem && (
                        <div className="flex gap-2">
                            <ListButton
                                onClick={() => {
                                    const id = items[0].itemID;
                                    if (id) editItem?.(id);
                                }}
                                buttonIcon={<FaPencil />}
                            />
                            <ListButton
                                onClick={() => {
                                    const id = items[0].itemID;
                                    if (id) deleteItem?.(id);
                                }}
                                buttonIcon={<FaTrashCan />}
                            />
                            <div className={"space-x-1.5"} hidden={items.length === 1}>
                                <ListButton onClick={() => switchItem(-1)} buttonIcon={<FaArrowLeft />} />
                                <ListButton onClick={() => switchItem(1)} buttonIcon={<FaArrowRight />} />
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ItemElement;

