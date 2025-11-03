import {useEffect, useState} from "react";
import {Item} from "../database/SaveList"
import ListInput from "../elements/ListInput";
import ListButton from "../elements/ListButton";
import {IoMdCloseCircleOutline} from "react-icons/io";
import ListTextarea from "@/app/elements/ListTextarea";
import {FaQuestionCircle} from "react-icons/fa";

type CreateItemProps = {
    setShowAddItem: (showAddItem: boolean) => void
    addItem: (item: Item) => void
    itemProps?: Item
}
export default function CreateItem({setShowAddItem, addItem, itemProps}: CreateItemProps) {
    const [itemName, setItemName] = useState('');
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemLink, setItemLink] = useState('');
    const [itemImageURL, setItemImageURL] = useState<string | null>(null);
    const [itemDescription, setItemDescription] = useState('');

    const [itemImageFile, setItemImageFile] = useState<FormData>();

    function handleAddItem() {
        const item: Item = {
            itemID: itemProps ? itemProps.itemID : undefined,
            itemName,
            itemQuantity,
            itemQuantityPurchased: itemProps ? itemProps.itemQuantityPurchased : undefined,
            itemLink,
            itemImageURL,
            itemImageFile,
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
            setItemImageURL(itemProps.itemImageURL);
            setItemDescription(itemProps.itemDescription);
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
                        <div className={"flex"}>
                            <ListInput label={'Item Name:'} type={'text'} value={itemName} onChange={(e) => setItemName(e.target.value)}></ListInput>
                            <DescriptiveQuestion description={"The name of your item"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex"}>
                            <ListInput label={'Item Quantity:'} type={'number'} min={1} value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))}></ListInput>
                            <DescriptiveQuestion description={"The number of this item you want"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex"}>
                            <ListInput label={'Item Link:'} type={'text'} value={itemLink} onChange={(e) => setItemLink(e.target.value)}></ListInput>
                            <DescriptiveQuestion description={"The link to where someone can purchase this item"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex"}>
                            <ListInput label={'Item Image URL:'} type={'text'} value={itemImageURL ? itemImageURL : ""} onChange={(e) => setItemImageURL(e.target.value)}></ListInput>
                            <DescriptiveQuestion description={"A link to an image that represents your item"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex"}>
                            <ListInput label={'Upload Image from Files:'} type={'file'} accept={"image/*"} onChange={(e) => {
                                const formData = new FormData();
                                const file = e.target.files?.[0];
                                if(file){
                                    formData.set("file", file)
                                    setItemImageFile(formData);
                                }
                            }}></ListInput>
                            <DescriptiveQuestion description={"Upload an image to represent your item"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex"}>
                            <ListTextarea label={'Item Description:'} cols={40} rows={5} value={itemDescription} onChange={(e) => setItemDescription(e.target.value)}></ListTextarea>
                            <DescriptiveQuestion description={"A description or extra details someone might need to know about purchasing this item"}></DescriptiveQuestion>
                        </div>
                        <ListButton buttonText={"Save"} onClick={() => handleAddItem()}></ListButton>
                    </div>
                </div>
            </div>
        </div>
    );
}

type Description = {
    description: string;
}

const DescriptiveQuestion = ({description}: Description) => {
    return (
        <>
            <div className="relative group inline-block">
                <FaQuestionCircle />
                <span className="absolute bottom-full mb-2 hidden group-hover:block w-max bg-gray-800 text-white text-sm rounded px-2 py-1">{description}</span>
            </div>
        </>
    )
}