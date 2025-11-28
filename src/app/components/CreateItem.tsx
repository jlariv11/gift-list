import {useEffect, useRef, useState} from "react";
import {Item} from "../database/SaveList"
import ListInput from "../elements/ListInput";
import ListButton from "../elements/ListButton";
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
        <div>
            <div>
                <div className={"p-2"}>
                    <div className={"w-full max-w-xl mx-auto"}>
                        <div className={"flex justify-center"}>
                            <ListInput label={'Item Name:'} type={'text'} value={itemName} onChange={(e) => setItemName(e.target.value)}></ListInput>
                            <DescriptiveQuestion description={"The name of your item"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex justify-center my-2"}>
                            <ListInput label={'Item Quantity:'} type={'number'} min={1} value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))}></ListInput>
                            <DescriptiveQuestion description={"The number of this item you want"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex justify-center my-2"}>
                            <ListInput label={'Item Link:'} type={'text'} value={itemLink} onChange={(e) => setItemLink(e.target.value)}></ListInput>
                            <DescriptiveQuestion description={"The link to where someone can purchase this item"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex justify-center my-2"}>
                            <ListInput label={'Item Image URL:'} type={'text'} value={itemImageURL ? itemImageURL : ""} onChange={(e) => setItemImageURL(e.target.value)}></ListInput>
                            <DescriptiveQuestion description={"A link to an image that represents your item"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex justify-center my-2"}>
                            <ListInput className={"max-w-75"} label={'Upload Image from Files:'} type={'file'} accept={"image/*"} onChange={(e) => {
                                const formData = new FormData();
                                const file = e.target.files?.[0];
                                if(file){
                                    formData.set("file", file)
                                    setItemImageFile(formData);
                                }
                            }}></ListInput>
                            <DescriptiveQuestion description={"Upload an image to represent your item"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex justify-center  my-2"}>
                            <ListTextarea label={'Item Description:'} cols={30} rows={5} value={itemDescription} onChange={(e) => setItemDescription(e.target.value)}></ListTextarea>
                            <DescriptiveQuestion description={"A description or extra details someone might need to know about purchasing this item"}></DescriptiveQuestion>
                        </div>
                        <div className={"flex justify-center"}>
                            <ListButton className={"w-2/3"} buttonText={"Save"} onClick={() => handleAddItem()}></ListButton>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

type Description = {
    description: string;
}

const DescriptiveQuestion = ({ description }: Description) => {
    const wrapperRef = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState<"left" | "right" | "top">("top");

    useEffect(() => {
        function updatePosition() {
            if (!wrapperRef.current) return;

            const rect = wrapperRef.current.getBoundingClientRect();
            const margin = 20;

            if (rect.right + 150 > window.innerWidth - margin) {
                setPosition("left");
            } else if (rect.left - 150 < margin) {
                setPosition("right");
            } else {
                setPosition("top");
            }
        }

        updatePosition();
        window.addEventListener("resize", updatePosition);
        return () => window.removeEventListener("resize", updatePosition);
    }, []);

    return (
        <div ref={wrapperRef} className="relative group inline-block">
            <FaQuestionCircle className="cursor-pointer" />
            <span
                className={`
                    absolute hidden group-hover:block
                    bg-gray-800 text-white text-sm rounded px-2 py-1 whitespace-normal min-w-40 max-w-60
                    ${position === "top" ? "bottom-full mb-2 left-1/2 transform -translate-x-1/2" : ""}
                    ${position === "left" ? "right-full mr-2 top-1/2 transform -translate-y-1/2" : ""}
                    ${position === "right" ? "left-full ml-2 top-1/2 transform -translate-y-1/2" : ""}
                `}
            >
                {description}
            </span>
        </div>
    );
};
