"use client"
import Image from "next/image";
import React, {useState} from "react";
import { Input } from "@nextui-org/input";

const ItemCard = () => {
  return (
    <div>
        <div className="w-1/2 border-red-700 border-2 flex justify-between mt-2 ml-2">
          <Input className="pl-2" type="text" placeholder="Item Name" />
          <a className="text-blue-700 underline" href="www.google.com">Link</a>
          <div>
            <Image width={50} height={50} src={"/add_image.svg"} alt="List Image"/>
            <a>Add Image</a>
          </div>
        </div>
    </div>
  )
}

export default function Home() {
  const [items, setItems] = useState<JSX.Element[]>([]);

  const addItem = () =>{
    setItems([...items, <ItemCard key={items.length} />]);
  } 
  return (
    <main className="">
      <Input className="w-1/2 p-2 border-2 border-black" type="text" placeholder="List Name" />
      <div className="w-1/2 border-2 border-black mt-2 pb-2">
      <Image className="border-2 border-black hover:bg-red-700 mt-2 ml-2" onClick={addItem} width={30} height={30} src={"/add_list_item.svg"} alt="Add Item"/>
      {items}
      </div>
      <div className="w-1/2 flex justify-between mt-2">
        <div className="border-2 border-black hover:bg-red-700">
          Share List
        </div>
        <div className="border-2 border-black hover:bg-red-700">
          Save List
        </div>
      </div>
    </main>
  );
}
