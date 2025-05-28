import {useEffect, useState} from "react";
import {Item} from "../database/SaveList"
import ListInput from "../elements/ListInput";
import ListButton from "../elements/ListButton";
import ReactDOM from "react-dom";
import {IoMdCloseCircleOutline} from "react-icons/io";

type CreateItemProps = {
    setShowAddItem: (showAddItem: boolean) => void
    addItem: (item: Item) => void
    itemProps?: Item
    modalDivID: string
}
export default function CreateItem({setShowAddItem, addItem, itemProps, modalDivID}: CreateItemProps) {
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemLink, setItemLink] = useState('');
    const [itemImage, setItemImage] = useState('');
    const [itemDescription, setItemDescription] = useState('');

    function handleAddItem() {
        const item: Item = {
            itemID: itemProps ? itemProps.itemID : undefined,
            itemName,
            itemQuantity,
            itemQuantityPurchased: itemProps ? itemProps.itemQuantityPurchased : undefined,
            itemLink,
            itemImage,
            itemDescription,
        }
        addItem(item);
        setShowAddItem(false);
    }

    useEffect(() => {
        if(itemProps){
            setItemName(itemProps.itemName);
            setItemQuantity(itemProps.itemQuantity);
            setItemLink(itemProps.itemLink);
            setItemImage(itemProps.itemImage);
            setItemDescription(itemProps.itemDescription);
        }
    }, [])

    const createItemContent = (
        <div className={"absolute top-0 left-0 w-full h-full flex justify-center items-center"}>
            <div className={"w-128 h-132 pb-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300 shadow-lg"}>
                <div className={"p-2"}>
                    <div className={"flex justify-between"}>
                        <h1 className={"text-2xl"}>Add an Item</h1>
                        <IoMdCloseCircleOutline onClick={() => setShowAddItem(false)} size={32} className={"text-xl text-orange-400 hover:text-orange-300 cursor-pointer"} />
                    </div>
                    <div className={"items-center"}>
                        <div>
                            <ListInput label={'Item Name:'} type={'text'} value={itemName} onChange={(e) => setItemName(e.target.value)}></ListInput>
                        </div>
                        <div>
                            <ListInput label={'Item Quantity:'} type={'number'} min={1} value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))}></ListInput>
                        </div>
                        <div>
                            <ListInput label={'Item Link:'} type={'text'} value={itemLink} onChange={(e) => setItemLink(e.target.value)}></ListInput>
                        </div>
                        <div>
                            <ListInput label={'Item Image:'} type={'text'} value={itemImage} onChange={(e) => setItemImage(e.target.value)}></ListInput>
                        </div>
                        <div>
                            <ListInput label={'Item Description:'} type={'textarea'} cols={50} rows={5} value={itemDescription} onChange={(e) => setItemDescription(e.target.value)}></ListInput>
                        </div>
                        <ListButton buttonText={"Save"} onClick={() => handleAddItem()}></ListButton>
                    </div>
                </div>
            </div>
        </div>
    )

    const modalDiv = document.getElementById(modalDivID);
    return (modalDiv !== null) ? ReactDOM.createPortal(createItemContent, modalDiv) : <div></div>;
}