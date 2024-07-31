"use client"
import React, {useState} from "react";
import Image from "next/image";
import { ItemCard, ItemCardShared } from "./components/ItemCard";
import { createList, saveList, loadList, ItemData, generateShareCode } from './SQLManager';
import { startTransition } from "react";
import { v4 as uuidv4 } from 'uuid';
import { Input } from "@nextui-org/input";
import CenteredLayout from "./components/CenteredLayout";


interface Item {
  id: string;
  data: ItemData
}

function ownerIdExists(ownerid: string | null | undefined){
  return (ownerid ?? "") !== "";
}
function shareIdExists(shareid: string | null | undefined){
  return (shareid ?? "") !== "";
}

export default function Home() {

  const [items, setItems] = useState<Item[]>([]);
  const [toDelete, setToDelete] = useState<string[]>([]);
  const [ownerid, setOwnerID] = useState<string>();
  const [shareid, setShareID] = useState<string>();
  const [isOwner, setListOwner] = useState<boolean>(true);
  const [listName, setListName] = useState<string>("");
  const [isSharedLastEdit, setSharedLastEdit] = useState<boolean>(true);
  const [ownerInput, setOwnerInput] = useState<string>("");
  const [shareInput, setShareInput] = useState<string>("");

  const addNewItem = () => {
    const newItem: Item = { id: uuidv4(), data:{itemName: "", link: "", image: "/add_image.svg", purchased: false, quantity: 1}};
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
      if(item.id == id){
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
      <Input className="p-2 border-2 border-white text-black" type="text" placeholder="List Name" value={listName} onChange={(e) => setListName(e.target.value)} title={listName}/>
      <div className="border-2 border-white">
      <Image className="border-2 border-white hover:bg-red-700 mt-2 ml-2 hover:cursor-pointer" onClick={addNewItem} width={30} height={30} src={"/add_list_item.svg"} alt="Add Item"/>
      {items.map(item => {
        if((shareid !== null || shareid !== "") && (ownerid == null || ownerid == "")){
          return <ItemCardShared key={item.id} id={item.id} name={item.data.itemName} itemLink={item.data.link} itemImage={item.data.image} itemQuantity={item.data.quantity} itemPurchased={item.data.purchased} handleDelete={() =>{}} onDataChange={handleDataChange} />
        }else{
          return <ItemCard key={item.id} id={item.id} name={item.data.itemName} itemLink={item.data.link} itemImage={item.data.image} itemQuantity={item.data.quantity} itemPurchased={item.data.purchased} handleDelete={handleDelete} onDataChange={handleDataChange} />
        }
      })}
      </div>
      <div className="flex justify-between mt-2">
        <div className="text-white border-2 border-white hover:bg-red-700 hover:cursor-pointer" onClick={(e) => {
          if(ownerid !== undefined){
            startTransition(async () => {
              const test = await generateShareCode(ownerid);
              setShareID(test);
            })
        }
        }}>
          Share List
        </div>
        <div className="text-white border-2 border-white hover:bg-red-700 hover:cursor-pointer" onClick={(e) =>
          startTransition(async () => {
            if(isOwner){
              if(ownerIdExists(ownerid)){
                const listOfData = items.map(item => item.data);
                const ids = items.map(item => item.id);
                saveList(ownerid as string, listName, ids, toDelete, listOfData);
                setToDelete([]);
              }else{
                const listOfData = items.map(item => item.data);
                const ids = items.map(item => item.id);
                setOwnerID(await createList(ids, toDelete, listOfData, listName));
                setToDelete([]);
              }
            }else{
              if(shareIdExists(shareid)){
                const listOfData = items.map(item => item.data);
                listOfData.map(item => console.log(item.purchased));
                const ids = items.map(item => item.id);
                saveList(shareid as string, listName, ids, toDelete, listOfData);
              }
            }
          })
        }>
          Save List
        </div>
      </div>
      <div className="text-white">
        <div>Owner ID: {ownerid}</div>
        <div>Share ID: {shareid}</div>
      </div>
      <div className="border-white text-white border-2 mt-4">
        <h1 className="pl-2 pt-2">Insert OwnerID: </h1>
        <Input className="p-2 text-black" type="text" placeholder="OwnerID" value={ownerInput} onChange={(e) => {setOwnerInput(e.target.value); setSharedLastEdit(false)}} />
        <h1 className="pl-2">Insert ShareID: </h1>
        <Input className="p-2 text-black" type="text" placeholder="ShareID" value={shareInput} onChange={(e) => {setShareInput(e.target.value); setSharedLastEdit(true)}} />
        <div className="text-white border-2 border-white hover:bg-red-700 hover:cursor-pointer text-center" 
        onClick={() => {
          startTransition(async () => {  
            const data = await loadList(isSharedLastEdit ? shareInput : ownerInput);
            setListName(data.listName);
            const newItems = [];
            for(var i = 0; i < data.itemIDs.length; i++){
              if(data.itemPurchased[i] && !ownerIdExists(ownerid)){
                continue;
              }
              const newItem: Item = { id: data.itemIDs[i], data:{itemName: data.itemNames[i], link: data.itemLinks[i], image:  data.itemImages[i], purchased: data.itemPurchased[i], quantity: data.itemQuantities[i]}};
              newItems.push(newItem);
            }
            setItems(newItems);
          }); 
          if(isSharedLastEdit){
            setShareID(shareInput);
            setOwnerInput("");
            setShareInput("");
            setOwnerID("");
            setListOwner(false);
          }else{
            setOwnerID(ownerInput);
            setOwnerInput("");
            setShareInput("");
            setShareID("");
            setListOwner(false);
          }
          } }>
          Load List
        </div>
      </div>
    </CenteredLayout>
    </main>
  );
}
