import { useEffect, useState } from "react";
import { Item } from "../database/SaveList";
import ListInput from "../elements/ListInput";
import ListButton from "../elements/ListButton";
import ListTextarea from "../elements/ListTextarea";
import { FaImage } from "react-icons/fa6";

type CreateItemProps = {
    setShowAddItem: (showAddItem: boolean) => void;
    addItem: (item: Item) => void;
    itemProps?: Item;
};

export default function CreateItem({setShowAddItem, addItem, itemProps}: CreateItemProps) {

    const [itemName, setItemName] = useState("");
    const [itemQuantity, setItemQuantity] = useState(1);
    const [itemLink, setItemLink] = useState("");
    const [itemImageURL, setItemImageURL] = useState<string | null>(null);
    const [itemDescription, setItemDescription] = useState("");

    function handleAddItem() {
        const item: Item = {
            itemID: itemProps?.itemID,
            itemName,
            itemQuantity,
            itemQuantityPurchased: itemProps?.itemQuantityPurchased,
            itemLink,
            itemImageURL,
            itemDescription,
        };

        addItem(item);
        setShowAddItem(false);
    }

    useEffect(() => {
        if (itemProps) {
            setItemName(itemProps.itemName);
            setItemQuantity(itemProps.itemQuantity);
            setItemLink(itemProps.itemLink);
            setItemImageURL(itemProps.itemImageURL);
            setItemDescription(itemProps.itemDescription);
        }
    }, [itemProps]);

    return (
        <div className="mx-auto w-full max-w-xl">

            <div className="space-y-6">

                {/* Basic information */}
                <div className="space-y-4">
                    <ListInput label="Gift name" placeholder="What would you like?" type="text" value={itemName} onChange={(e) => setItemName(e.target.value)}/>

                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-[1fr_120px]">
                        <ListInput label="Purchase link" placeholder="https://..." type="url" value={itemLink} onChange={(e) => setItemLink(e.target.value)}/>
                        <ListInput label="Quantity" type="number" min={1} value={itemQuantity} onChange={(e) => setItemQuantity(Number(e.target.value))}/>
                    </div>
                </div>

                {/* Description */}
                <ListTextarea label="Description" helperText="Add details like size, color, style, or anything else someone should know." placeholder="Anything someone should know about this gift..." rows={4} value={itemDescription} onChange={(e) => setItemDescription(e.target.value)}/>

                {/* Image */}
                <div>
                    <div className="mb-2">
                        <h3 className="text-sm font-medium text-foreground">Gift image</h3>
                        <p className="mt-1 text-xs text-muted">Add an image URL or upload one from your device.</p>
                    </div>

                    <div className=" rounded-xl border border-border bg-page p-4">
                        <div className="flex gap-4">

                            {/* Preview */}
                            <div className=" flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-surface">
                                {itemImageURL ? (<img src={itemImageURL} alt="Gift preview" className="h-full w-full object-cover"/>) : (<FaImage className="text-xl text-muted" />)}
                            </div>

                            <div className="flex min-w-0 flex-1 flex-col">
                                <ListInput placeholder="Paste an image URL" type="url" value={itemImageURL ?? ""} onChange={(e) => setItemImageURL(e.target.value)}/>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Actions */}
                <div className=" flex items-center justify-end gap-3 border-t border-border pt-5">
                    <ListButton variant="ghost" buttonText="Cancel" onClick={() => setShowAddItem(false)}/>
                    <ListButton buttonText={itemProps ? "Save changes" : "Add gift"} onClick={handleAddItem}/>
                </div>
            </div>
        </div>
    );
}