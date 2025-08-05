import {Item} from "@/app/database/SaveList";

export function itemsAsGroupedArray(items: Item[]) {
    const groupedItems: Item[][] = [];
    for(const item of items){
        if(item.alternateForId){
            console.log("skipping", item.itemName, item.alternateForId)
            continue;
        }
        const alternates = items.filter(i => i.alternateForId === item.itemID);
        groupedItems.push([item, ...alternates]);
    }
    return groupedItems;
}