import { Item } from "../database/SaveList";
import {FaMinus, FaPencil, FaTrashCan, FaArrowUpRightFromSquare} from "react-icons/fa6";
import { FaPlus } from "react-icons/fa";
import ListButton from "./ListButton";
import ListInput from "./ListInput";
import { useRef, useState } from "react";
import { TutorialState } from "../ShareList/tutorial/ShareTutorial";
import { HighlightSquare } from "../ShareList/tutorial/HighlightSquare";

export interface ItemElementProps {
    item: Item;
    editItem?: (itemID: number) => void;
    deleteItem?: (itemID: number) => void;
    updatePurchaseCount?: (itemID: number | undefined, quantity: number) => void;
    shareTutorialState?: TutorialState;
}

const ItemElement = ({item, editItem, deleteItem, updatePurchaseCount, shareTutorialState}: ItemElementProps) => {
    return editItem ? (<EditItemElement item={item} editItem={editItem} deleteItem={deleteItem}/>) : (<ViewItemElement item={item} updatePurchaseCount={updatePurchaseCount} shareTutorialState={shareTutorialState}/>);
};
const ViewItemElement = ({item, updatePurchaseCount, shareTutorialState}: ItemElementProps) => {
    const [localQuantityPurchased, setLocalQuantityPurchased] = useState(0);

    const availableQuantity = Math.max(
        0,
        item.itemQuantity - (item.itemQuantityPurchased ?? 0)
    );

    const multiQuantityItem = availableQuantity > 1;

    const [itemMarkedForPurchase, setItemMarkedForPurchase] = useState(false);

    const linkRef = useRef<HTMLAnchorElement>(null);
    const markPurchaseRef = useRef<HTMLInputElement>(null);

    function clamp(value: number, min: number, max: number) {
        return Math.min(Math.max(value, min), max);
    }

    return (
        <>
            <article className=" my-3 overflow-hidden rounded-xl border border-border bg-surface transition hover:border-[#D8D8D2] hover:shadow-sm">
                <div className="flex flex-col sm:flex-row">

                    {/* Product image */}
                    <div className="shrink-0 bg-surface-muted sm:w-48 lg:w-56">
                        {item.itemImageURL ? (<img className=" h-52 w-full object-cover sm:h-full sm:min-h-[210px]" src={item.itemImageURL} alt={item.itemName}/>) : (<div className=" flex h-52 items-center justify-center px-4 text-sm text-muted sm:h-full sm:min-h-[210px]">No image</div>)}
                    </div>

                    {/* Item information */}
                    <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">

                        <div className="flex-1">
                            <h2 className=" break-words text-xl font-semibold tracking-tight text-foreground">{item.itemName}</h2>

                            {item.itemDescription && (<p className=" mt-2 max-w-2xl break-words text-sm leading-6 text-muted">{item.itemDescription}</p>)}

                            {/* Quantity information */}
                            {item.itemQuantity > 1 && (
                                <div className=" mt-4 flex flex-wrap gap-x-5 gap-y-1 text-sm">
                                    <span className="text-muted">
                                        Requested{" "}
                                        <span className="font-medium text-foreground">{item.itemQuantity}</span>
                                    </span>

                                    <span className="text-muted">
                                        Purchased{" "}
                                        <span className="font-medium text-foreground">{item.itemQuantityPurchased ?? 0}</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Purchase controls */}
                        <div className=" mt-6 flex flex-col gap-4 border-t border-border pt-4 lg:flex-row lg:items-center lg:justify-between">
                            <div className="flex flex-wrap items-center gap-4">

                                <label className=" flex cursor-pointer select-none items-center gap-3 text-sm font-medium text-foreground">
                                    <input
                                        ref={markPurchaseRef} type="checkbox" checked={itemMarkedForPurchase} className=" h-4 w-4 accent-primary cursor-pointer"
                                        onChange={(e) => {
                                            if (!multiQuantityItem) {
                                                const quantity =
                                                    e.target.checked ? 1 : 0;

                                                setLocalQuantityPurchased(quantity);

                                                updatePurchaseCount?.(
                                                    item.itemID,
                                                    quantity
                                                );
                                            } else if (!e.target.checked) {
                                                const quantity =
                                                    item.itemQuantityPurchased ?? 0;

                                                setLocalQuantityPurchased(quantity);

                                                updatePurchaseCount?.(
                                                    item.itemID,
                                                    quantity
                                                );
                                            }

                                            setItemMarkedForPurchase(
                                                e.target.checked
                                            );
                                        }}
                                    />
                                    Mark as purchased
                                </label>

                                {itemMarkedForPurchase && multiQuantityItem && (
                                    <div className=" flex items-center rounded-lg border border-border bg-page p-1">
                                        <button type="button" aria-label="Decrease quantity" className=" flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground"
                                            onClick={() => {
                                                const quantity = clamp(
                                                    localQuantityPurchased - 1,
                                                    1,
                                                    availableQuantity
                                                );

                                                setLocalQuantityPurchased(quantity);

                                                updatePurchaseCount?.(
                                                    item.itemID,
                                                    quantity
                                                );
                                            }}
                                        >
                                            <FaMinus className="text-xs" />
                                        </button>

                                        <ListInput className=" w-12 border-0 bg-transparent px-1 py-1.5 text-center focus:ring-0" label="" type="number" value={localQuantityPurchased} min={1} max={availableQuantity}
                                               onChange={(e) => {
                                                   const checked = e.target.checked;
                                                   setItemMarkedForPurchase(checked);

                                                   const quantity = checked ? 1 : 0;

                                                   setLocalQuantityPurchased(quantity);
                                                   updatePurchaseCount?.(item.itemID, quantity);
                                               }}
                                            onBlur={(e) => {
                                                const quantity = clamp(
                                                    Number(e.target.value),
                                                    Number(e.target.min),
                                                    Number(e.target.max)
                                                );

                                                setLocalQuantityPurchased(
                                                    quantity
                                                );

                                                if (e.target.value === "") {
                                                    e.target.value = String(
                                                        item.itemQuantityPurchased ?? 0
                                                    );

                                                    updatePurchaseCount?.(
                                                        item.itemID,
                                                        Number(e.target.value)
                                                    );
                                                }
                                            }}
                                            onFocus={(e) => {
                                                e.target.value = "";
                                            }}
                                        />

                                        <button type="button" aria-label="Increase quantity" className=" flex h-8 w-8 items-center justify-center rounded-md text-muted transition-colors hover:bg-surface hover:text-foreground"
                                            onClick={() => {
                                                const quantity = clamp(
                                                    localQuantityPurchased + 1,
                                                    1,
                                                    availableQuantity
                                                );

                                                setLocalQuantityPurchased(quantity);

                                                updatePurchaseCount?.(
                                                    item.itemID,
                                                    quantity
                                                );
                                            }}
                                        >
                                            <FaPlus className="text-xs" />
                                        </button>
                                    </div>
                                )}
                            </div>

                            {item.itemLink && (
                                <a ref={linkRef} href={item.itemLink} target="_blank" rel="noopener noreferrer" className=" inline-flex items-center gap-2 text-sm font-medium text-primary transition-colors hover:text-primary-hover">
                                    View gift
                                    <FaArrowUpRightFromSquare className="text-xs" />
                                </a>
                            )}
                        </div>
                    </div>
                </div>
            </article>

            {shareTutorialState === TutorialState.PURCHASE_LINK && (
                <HighlightSquare targetRef={linkRef} />
            )}

            {shareTutorialState === TutorialState.MARK_FOR_PURCHASE && (
                <HighlightSquare targetRef={markPurchaseRef} />
            )}
        </>
    );
};

const EditItemElement = ({item, editItem, deleteItem}: ItemElementProps) => {
    return (
        <article className=" my-3 overflow-hidden rounded-xl border border-border bg-surface transition hover:border-[#D8D8D2] hover:shadow-sm">
            <div className="flex flex-col sm:flex-row">

                {/* Image */}
                <div className="shrink-0 bg-surface-muted sm:w-48 lg:w-56">
                    {item.itemImageURL ? (<img className=" h-48 w-full object-cover sm:h-full sm:min-h-[190px]" src={item.itemImageURL} alt={item.itemName}/>) : (<div className=" flex h-48 items-center justify-center text-sm text-muted sm:h-full">No image</div>)}
                </div>

                {/* Content */}
                <div className="flex min-w-0 flex-1 flex-col p-5 sm:p-6">

                    <div className="flex-1">
                        <h2 className=" break-words text-xl font-semibold tracking-tight text-foreground">{item.itemName}</h2>

                        {item.itemDescription ? (<p className=" mt-2 max-w-2xl break-words text-sm leading-6 text-muted">{item.itemDescription}</p>) : (<p className="mt-2 text-sm italic text-muted">No description</p>)}

                        <p className="mt-4 text-sm text-muted">
                            Quantity{" "}
                            <span className="font-medium text-foreground">{item.itemQuantity}</span>
                        </p>
                    </div>

                    {/* Actions */}
                    <div className=" mt-6 flex justify-end gap-2 border-t border-border pt-4">
                        <ListButton variant="secondary" aria-label="Edit gift"
                            onClick={() => {
                                if (item.itemID) {
                                    editItem?.(item.itemID);
                                }
                            }}
                            buttonIcon={<FaPencil />}
                        />

                        <ListButton variant="danger" aria-label="Delete gift"
                            onClick={() => {
                                if (item.itemID) {
                                    deleteItem?.(item.itemID);
                                }
                            }}
                            buttonIcon={<FaTrashCan />}
                        />
                    </div>
                </div>
            </div>
        </article>
    );
};

export default ItemElement;