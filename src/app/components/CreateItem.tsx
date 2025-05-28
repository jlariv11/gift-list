import {useEffect, useState} from "react";
import {Item} from "../database/SaveList"
import ListInput from "../elements/ListInput";
import ListButton from "../elements/ListButton";

type CreateItemProps = {
    setShowAddItem: (showAddItem: boolean) => void
    addItem: (item: Item) => void
    itemProps?: Item
}
export default function CreateItem({setShowAddItem, addItem, itemProps}: CreateItemProps) {
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

    return (
        <div>
            <div className={"w-128 h-132 bg-gray-500 rounded-md shadow-sm"}>
                <div className={"p-2"}>
                    <h1>Add an Item</h1>
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
                        <ListButton buttonText={"Close"} onClick={() => setShowAddItem(false)}></ListButton>
                        <ListButton buttonText={"Save"} onClick={() => handleAddItem()}></ListButton>
                    </div>
                </div>
            </div>
        </div>
    )
}