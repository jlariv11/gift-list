import {useEffect, useState} from "react";
import {Item} from "../database/SaveList"
import ListInput from "../elements/ListInput";
import ListButton from "../elements/ListButton";
import {IoMdCloseCircleOutline} from "react-icons/io";
import ListTextarea from "@/app/elements/ListTextarea";

type CreateItemProps = {
    setShowAddItem: (showAddItem: boolean) => void
    addItems: (items: Item[]) => void
    itemProps?: Item[]
    ownerID: string;
}
export default function CreateItem({setShowAddItem, addItems, itemProps}: CreateItemProps) {
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemLink, setItemLink] = useState('');
    const [itemImageURL, setItemImageURL] = useState<string | null>(null);
    const [itemDescription, setItemDescription] = useState('');

    const [itemImageFile, setItemImageFile] = useState<FormData>();

    const [alternates, setAlternates] = useState<Item[]>([]);
    const [alternateIndex, setAlternateIndex] = useState(0);
    const [original, setOriginal] = useState<Item>();


    function createItem(){
        const item: Item = {
            itemID: (itemProps && itemProps[alternateIndex]) ? alternates[alternateIndex].itemID : undefined,
            itemName,
            itemQuantity,
            itemQuantityPurchased: (itemProps && itemProps[alternateIndex]) ? alternates[alternateIndex].itemQuantityPurchased : undefined,
            itemLink,
            itemImageURL,
            itemImageFile,
            itemDescription,
            alternateForId: (alternates.length > 0 && original) ? original.itemID : undefined
        }
        return item;
    }

    function handleAddItem() {
        console.log(alternates);
        const updated = [...alternates];
        updated[alternateIndex] = createItem();
        setAlternates(updated);
        addItems(updated);
        setShowAddItem(false);
    }

    function handleCreateAlternate() {
        const item = createItem();
        const updated = [...alternates];
        updated[alternateIndex] = item;
        setAlternates(updated);
        setOriginal(item);
        handleSwitchItems(1);
    }

    function handleSwitchItems(dir: 1 | -1) {
        if(dir === -1 && alternateIndex <= 0){
            return;
        }
        const updated = [...alternates];
        updated[alternateIndex] = createItem();
        setAlternates(updated);
        if(dir === 1 && alternateIndex + dir > (alternates.length - 1)) {
            setAlternateIndex(alternateIndex + dir);
            setItemName("");
            setItemQuantity(1);
            setItemLink("");
            setItemImageURL("");
            setItemDescription("");
            setItemImageFile(new FormData());
        }else {
            const item = alternates[alternateIndex + dir];
            setAlternateIndex(alternateIndex + dir);
            setItemName(item.itemName);
            setItemQuantity(item.itemQuantity);
            setItemLink(item.itemLink);
            setItemImageURL(item.itemImageURL);
            setItemDescription(item.itemDescription);
        }
    }



    useEffect(() => {
        if(itemProps){
            setItemName(itemProps[alternateIndex].itemName);
            setItemQuantity(itemProps[alternateIndex].itemQuantity);
            setItemLink(itemProps[alternateIndex].itemLink);
            setItemImageURL(itemProps[alternateIndex].itemImageURL);
            setItemDescription(itemProps[alternateIndex].itemDescription);
            setAlternates(itemProps);
            setOriginal(itemProps[alternateIndex]);
        }
    }, [])

    return (
        <div className={"absolute top-0 left-0 w-full h-full flex justify-center items-center"}>
            <div className={"w-128 h-141 pb-4 border-4 rounded-md border-gray-400 p-4 bg-gray-300 shadow-lg"}>
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
                            <ListInput label={'Item Image URL:'} type={'text'} value={itemImageURL ? itemImageURL : ""} onChange={(e) => setItemImageURL(e.target.value)}></ListInput>
                            <ListInput label={'Upload Image from Files:'} type={'file'} accept={"image/*"} onChange={(e) => {
                                const formData = new FormData();
                                const file = e.target.files?.[0];
                                if(file){
                                    formData.set("file", file)
                                    setItemImageFile(formData);
                                }
                            }}></ListInput>
                        </div>
                        <div>
                            <ListTextarea label={'Item Description:'} cols={50} rows={5} value={itemDescription} onChange={(e) => setItemDescription(e.target.value)}></ListTextarea>
                        </div>
                        <div className={"flex justify-between"}>
                            <div className={"space-x-1.5"}>
                                <ListButton buttonText={"Save"} onClick={() => handleAddItem()}></ListButton>
                            </div>
                            <div className={"space-x-1.5"} hidden={!itemProps}>
                                <ListButton disabled={alternateIndex <= 0} buttonText={"Prev Alt Item"} onClick={() => handleSwitchItems(-1)}></ListButton>
                                <ListButton disabled={alternateIndex >= alternates.length} buttonText={"Next Alt Item"} onClick={() => handleSwitchItems(1)}></ListButton>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}