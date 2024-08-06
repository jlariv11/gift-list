"use client"
import React, { useState } from "react";
import Image from "next/image";
import { ItemCard } from "./components/ItemCard";
import { createList, saveList, loadList, ItemData, generateShareCode, getShareCode } from './SQLManager';
import { startTransition } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@nextui-org/input";
import CenteredLayout from "./components/CenteredLayout";

interface Item {
  id: string;
  data: ItemData
}

function listIdExists(listid: string | null | undefined) {
  return (listid ?? "") !== "";
}

export default function Home() {

  const [items, setItems] = useState<Item[]>([]);
  const [toDelete, setToDelete] = useState<string[]>([]);
  const [listid, setListID] = useState<string>();
  const [isOwner, setListOwner] = useState<boolean>(true);
  const [listName, setListName] = useState<string>("");
  const [codeInput, setCodeInput] = useState<string>("");
  // This should only be used to display the share ID. It should not be used in querying or any code logic
  const [shareIDTextOnly, setShareID] = useState<string>("");


  const addNewItem = () => {
    const newItem: Item = { id: uuidv4(), data: { itemName: "", link: "", image: "/add_image.svg", quantity: 1, quantityPurchased: 1 } };
    setItems([...items, newItem]);
  }
  const handleDelete = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setToDelete([...toDelete, id]);
    setItems(updatedItems);
  };
  const handleDataChange = (id: string, data: ItemData) => {
    const updatedItems = [...items];
    updatedItems.map(item => {
      if (item.id == id) {
        item.data = data;
      }
    });
    setItems(updatedItems);
  }
  return (
    <main>      
      <div className="w-screen h-24 bg-slate-500 flex items-center">
        <h1 className=" ml-2 text-2xl">MyListMaker: BEYOND</h1>
      </div>
      <CenteredLayout>
        {!isOwner && <h1 className="p-2 border-2 border-white text-white font-bold uppercase text-center">{listName}</h1>}
        {isOwner && <Input className="p-2 border-2 border-white text-black" type="text" placeholder="List Name" value={listName} onChange={(e) => setListName(e.target.value)} title={listName} />}
        <div className="border-2 border-white">
          {items.map(item => {
            return <ItemCard key={item.id} id={item.id} name={item.data.itemName} itemLink={item.data.link} itemImage={item.data.image} itemQuantity={item.data.quantity} itemQuantityPurchased={item.data.quantityPurchased} isShared={!isOwner} handleDelete={handleDelete} onDataChange={handleDataChange} />
          })}
          <Image className="border-2 border-white hover:bg-red-700 mt-2 ml-2 hover:cursor-pointer" onClick={addNewItem} width={30} height={30} src={"/add_list_item.svg"} alt="Add Item" hidden={!isOwner}/>
        </div>
        <div className="flex justify-between mt-2">
          <div className="text-white border-2 border-white hover:bg-red-700 hover:cursor-pointer" onClick={(e) => {
            if (isOwner && listid !== undefined) {
              startTransition(async () => {
                const id = await generateShareCode(listid);
                setShareID(id);
              })
            }
          }}>
            Share List
          </div>
          <div className="text-white border-2 border-white hover:bg-red-700 hover:cursor-pointer" onClick={(e) =>
            startTransition(async () => {
              if (isOwner) {
                // If the list owner is logged in, save the list - else this is a new list so create a list in the database
                if (listIdExists(listid)) {
                  const listOfData = items.map(item => item.data);
                  const ids = items.map(item => item.id);
                  saveList(listid as string, listName, ids, toDelete, listOfData);
                  setToDelete([]);
                } else {
                  const listOfData = items.map(item => item.data);
                  const ids = items.map(item => item.id);
                  setListID(await createList(ids, toDelete, listOfData, listName));
                  setToDelete([]);
                }
              } else {
                // If the user is not the list's owner, but there is an ID(it is the share code) save the shared list data
                if (listIdExists(listid)) {
                  const listOfData = items.map(item => item.data);
                  const ids = items.map(item => item.id);
                  saveList(listid as string, listName, ids, toDelete, listOfData);
                }
              }
            })
          }>
            Save List
          </div>
        </div>
        <div className="text-white">
          <div>Owner ID: {isOwner ? listid : ""}</div>
          <div>Share ID: {isOwner ? shareIDTextOnly : listid}</div>
        </div>
        <div className="border-white text-white border-2 mt-4">
          <h1 className="pl-2 pt-2">Insert Owner/Share ID: </h1>
          <Input className="p-2 text-black" type="text" placeholder="Owner/Share ID" value={codeInput} onChange={(e) => { setCodeInput(e.target.value); }} />
          <div className="text-white border-2 border-white hover:bg-red-700 hover:cursor-pointer text-center"
            onClick={() => {
              if((codeInput ?? "") == ""){
                return;
              }
              setItems([]);
              startTransition(async () => {
                const data = await loadList(codeInput);
                setListOwner(!data.isShareCode);
                setListID(codeInput);
                setShareID(await getShareCode(codeInput));
                setListName(data.listName);
                const newItems = [];
                for (var i = 0; i < data.itemIDs.length; i++) {
                  if(data.isShareCode && data.itemQuantities[i] == data.itemQuantitiesPurchased[i]){
                    continue;
                  }
                  const newItem: Item = { id: data.itemIDs[i], data: { itemName: data.itemNames[i], link: data.itemLinks[i], image: data.itemImages[i], quantity: data.itemQuantities[i], quantityPurchased: data.itemQuantitiesPurchased[i] } };
                  newItems.push(newItem);
                }
                setItems(newItems);
              });
              setCodeInput("");
            }}>
            Load List
          </div>
        </div>
      </CenteredLayout>
    </main>
  );
}
