import { Input } from "@nextui-org/input";
import Image from "next/image";
import React, { useState } from 'react';

  interface ItemCardProps {
    id: string;
    handleDelete: (id: string) => void;
    onDataChange: (id: string, data: {itemName: string, link: string, image: string}) => void;
  }

  export const ItemCard:React.FC<ItemCardProps> = ({ id, handleDelete, onDataChange }) =>  {
    const [itemName, setItemName] = useState("");
    const [link, setLink] = useState("");
    const [image, setImage] = useState("");
    const handleDataChange = (id: string) => {
        onDataChange(id, { itemName, link, image });
      };
    return (
      <div>
          <div className="border-red-700 border-2 flex justify-between m-2">
            <Input className="pl-2 text-black" type="text" placeholder="Item Name" onChange = {(e) => setItemName(e.target.value)} onBlur = {() => handleDataChange(id)}/>
            <a className="text-blue-700 underline" href="https://www.google.com">Edit Link</a>
            <div className="">
              <Image width={50} height={50} src={"/add_image.svg"} alt="List Image"/>
              <a className="text-black">Add Image</a>
            </div>
          </div>
          <div className="ml-2 text-red-700 font-bold hover:cursor-pointer" onClick={() => handleDelete(id)}>
            DELETE
          </div>
      </div>
    )
  }