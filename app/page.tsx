"use client"
import React, {useState} from "react";
import { Input } from "@nextui-org/input";
import Image from "next/image";
import { ItemCard } from "./components/ItemCard";
import { createList, saveList } from './SQLManager';
import { startTransition } from "react";
import { v4 as uuidv4 } from 'uuid';


interface Item {
  id: number;
  data: {itemName: string, link: string, image: string}
}

export default function Home() {

  const [items, setItems] = useState<Item[]>([]);
  const [toDelete, setToDelete] = useState<number[]>([]);
  const [ownerid, setOwnerID] = useState<string>();
  const [listName, setListName] = useState<string>("");
  const addItem = () => {
    const newItem: Item = { id: uuidv4(), data:{itemName: "", link: "", image: "/add_image.svg"}};
    setItems([...items, newItem]);
  }
  const handleDelete = (id: number) => {
    const updatedItems = items.filter(item => item.id !== id);
    setToDelete([...toDelete, id]);
    setItems(updatedItems);
  };
  const handleDataChange = (id: number, data: {itemName: string, link: string, image: string}) => {
    const updatedItems = [...items];
    updatedItems.map(item => {
      if(item.id == id){
        item.data = data;
      }
    });
    setItems(updatedItems);
  }
  return (
    <main className="mt-2 ml-2">
      <Input className="w-1/2 p-2 border-2 border-black text-black" type="text" placeholder="List Name" onChange={(e) => setListName(e.target.value)}/>
      <div className="w-1/2 border-2 border-black mt-2 pb-2">
      <Image className="border-2 border-black hover:bg-red-700 mt-2 ml-2 hover:cursor-pointer" onClick={addItem} width={30} height={30} src={"/add_list_item.svg"} alt="Add Item"/>
      {items.map(item => (
        <ItemCard key={item.id} id={item.id} handleDelete={handleDelete} onDataChange={handleDataChange} />
      ))}
      </div>
      <div className="w-1/2 flex justify-between mt-2">
        <div className="text-black border-2 border-black hover:bg-red-700 hover:cursor-pointer">
          Share List
        </div>
        <div className="text-black border-2 border-black hover:bg-red-700 hover:cursor-pointer" onClick={(e) =>
          startTransition(async () => {
            if(ownerid == null || ownerid == ""){
              const listOfData = items.map(item => item.data);
              const ids = items.map(item => item.id);
              setOwnerID(await createList(ids, toDelete, listOfData, listName));
              setToDelete([]);
            }else{
              const listOfData = items.map(item => item.data);
              const ids = items.map(item => item.id);
              ids.map(id => console.log(id + " " + listOfData[ids.indexOf(id)]));
              saveList(ownerid, ids, toDelete, listOfData);
              setToDelete([]);
            }
          })
        }>
          Save List
        </div>
      </div>
      <div className="text-black">
        <a>Owner ID: {ownerid}</a>
      </div>
    </main>
  );
}
