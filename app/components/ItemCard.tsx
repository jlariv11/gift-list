import { Input } from "@nextui-org/input";
import Image, { ImageLoaderProps } from "next/image";
import React, { useState } from 'react';

  interface ItemCardProps {
    id: string;
    name: string;
    itemLink: string;
    itemImage: string;
    handleDelete: (id: string) => void;
    onDataChange: (id: string, data: {itemName: string, link: string, image: string}) => void;
  }

  const imageLoader = ({ src }: ImageLoaderProps) => {
    return src;
  };
  

  export const ItemCard:React.FC<ItemCardProps> = ({ id, name, itemLink, itemImage, handleDelete, onDataChange }) =>  {
    const [itemName, setItemName] = useState(name);
    const [link, setLink] = useState(itemLink);
    const [image, setImage] = useState(itemImage);
    const handleDataChange = (id: string) => {
        onDataChange(id, { itemName, link, image });
      };
    return (
      <div>
          <div className="border-red-700 border-2 flex justify-between m-2">
            <Input className="pl-2 text-black" type="text" placeholder="Item Name" defaultValue={itemName} onChange = {(e) => setItemName(e.target.value)} onBlur = {() => handleDataChange(id)}/>
            <a className="text-blue-700 underline" href={link}>Edit Link</a>
            <div className="">
              <Image width={50} height={50} src={image} loader={imageLoader} alt="List Image"/>
              <a className="text-black">Add Image</a>
            </div>
          </div>
          <div className="ml-2 text-red-700 font-bold hover:cursor-pointer" onClick={() => handleDelete(id)}>
            DELETE
          </div>
      </div>
    )
  }