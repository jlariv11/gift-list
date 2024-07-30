"use client"
import React, {useState} from "react";
import { Input } from "@nextui-org/input";
import Image from "next/image";
import { ItemCard, ItemCardShared } from "./components/ItemCard";
import { createList, saveList, loadList, ListData, generateShareCode } from './SQLManager';
import { startTransition } from "react";
import { v4 as uuidv4 } from 'uuid';
import CenteredLayout from "./components/CenteredLayout";


interface Item {
  id: string;
  data: {itemName: string, link: string, image: string}
}

export default function Home() {

  const [items, setItems] = useState<Item[]>([]);
  const [toDelete, setToDelete] = useState<string[]>([]);
  const [ownerid, setOwnerID] = useState<string>();
  const [shareid, setShareID] = useState<string>();
  const [listName, setListName] = useState<string>("");
  const [isShared, setShared] = useState<boolean>(true);
  const [ownerInput, setOwnerInput] = useState<string>("");
  const [shareInput, setShareInput] = useState<string>("");
  const addNewItem = () => {
    const newItem: Item = { id: uuidv4(), data:{itemName: "", link: "", image: "/add_image.svg"}};
    setItems([...items, newItem]);
  }
  const handleDelete = (id: string) => {
    const updatedItems = items.filter(item => item.id !== id);
    setToDelete([...toDelete, id]);
    setItems(updatedItems);
  };
  const handleDataChange = (id: string, data: {itemName: string, link: string, image: string}) => {
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
          return <ItemCardShared key={item.id} id={item.id} name={item.data.itemName} itemLink={item.data.link} itemImage={item.data.image} />
        }else{
          return <ItemCard key={item.id} id={item.id} name={item.data.itemName} itemLink={item.data.link} itemImage={item.data.image} handleDelete={handleDelete} onDataChange={handleDataChange} />
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
            if((shareid !== null && shareid !== "")){
              return;
            }
            if((ownerid == null || ownerid == "")){
              const listOfData = items.map(item => item.data);
              const ids = items.map(item => item.id);
              setOwnerID(await createList(ids, toDelete, listOfData, listName));
              setToDelete([]);
            }else{
              const listOfData = items.map(item => item.data);
              const ids = items.map(item => item.id);
              saveList(ownerid, listName, ids, toDelete, listOfData);
              setToDelete([]);
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
        <Input className="p-2 text-black" type="text" placeholder="OwnerID" value={ownerInput} onChange={(e) => {setOwnerInput(e.target.value); setShared(false)}} />
        <h1 className="pl-2">Insert ShareID: </h1>
        <Input className="p-2 text-black" type="text" placeholder="ShareID" value={shareInput} onChange={(e) => {setShareInput(e.target.value); setShared(true)}} />
        <div className="text-white border-2 border-white hover:bg-red-700 hover:cursor-pointer text-center" 
        onClick={() => {
          startTransition(async () => {  
            const data = await loadList(isShared ? shareInput : ownerInput);
            setListName(data.listName);
            const newItems = [];
            for(var i = 0; i < data.itemIDs.length; i++){
              const newItem: Item = { id: data.itemIDs[i], data:{itemName: data.itemNames[i], link: data.itemLinks[i], image:  data.itemImages[i]}};
              newItems.push(newItem);
            }
            setItems(newItems);
          }); 
          if(isShared){
            setShareID(shareInput);
            setOwnerInput("");
            setShareInput("");
            setOwnerID("");
          }else{
            setOwnerID(ownerInput);
            setOwnerInput("");
            setShareInput("");
            setShareID("");
          }
          } }>
          Load List
        </div>
      </div>
    </CenteredLayout>
    </main>
  );
}
