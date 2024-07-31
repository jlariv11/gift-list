import Image, { ImageLoaderProps } from "next/image";
import React, { useState } from 'react';
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { ItemData } from "../SQLManager";
import { Input } from "@nextui-org/react"

  interface ItemCardProps {
    id: string;
    name: string;
    itemLink: string;
    itemImage: string;
    itemQuantity: number;
    itemPurchased: boolean;
    handleDelete: (id: string) => void;
    onDataChange: (id: string, data: ItemData) => void;
  }

  const imageLoader = ({ src }: ImageLoaderProps) => {
    return src;
  };
  

  export const ItemCard:React.FC<ItemCardProps> = ({ id, name, itemLink, itemImage, itemQuantity, itemPurchased, handleDelete, onDataChange }) =>  {
    const [itemName, setItemName] = useState(name);
    const [link, setLink] = useState(itemLink);
    const [image, setImage] = useState(itemImage);
    const [quantity, setQuantity] = useState(itemQuantity);
    const [purchased, setPurchased] = useState(itemPurchased);
    const [imageLinkHidden, setLinkHidden] = useState(true);
    const handleDataChange = (id: string) => {
        onDataChange(id, { itemName, link, image, purchased, quantity });
      };
    return (
      
      <div>
        <Card className="py-4 bg-slate-800 mb-10 rounded-xl">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
      <Input className="pl-2 pb-2 text-black" type="text" placeholder="Item Name" defaultValue={itemName} onChange = {(e) => setItemName(e.target.value)} onBlur = {() => handleDataChange(id)}/>
      <Input className="pl-2 pb-2 text-black" type="text" placeholder="Insert Link" defaultValue={link} onChange = {(e) => setLink(e.target.value)} onBlur = {() => handleDataChange(id)}/>
      </CardHeader>
      <CardBody className="overflow-visible py-2 pl-2 flex-wrap justify-center items-center">
      <Image className="pb-2" width={270} height={270} src={image} loader={imageLoader} alt="List Image" onClick={() => setLinkHidden(!imageLinkHidden)}/>
      <Input className="pl-2 text-black" type="text" placeholder="Insert Image Link" defaultValue={image=="/add_image.svg" ? "" : image} onChange = {(e) => setImage(e.target.value)} onBlur = {() => handleDataChange(id)} hidden={imageLinkHidden}/>
      <Input type="number" defaultValue={String(quantity)} onChange={(e) => setQuantity(Number(e.target.value))} onBlur={() =>  handleDataChange(id)}/>
      </CardBody>
      <div className="pl-2 pt-2 text-red-700 font-bold hover:cursor-pointer" onClick={() => handleDelete(id)}>
            DELETE
      </div>
    </Card>
      </div>
    )
  }

  export const ItemCardShared:React.FC<ItemCardProps> = ({ id, name, itemLink, itemImage, itemQuantity, itemPurchased, onDataChange}) =>  {
    const [itemName, setItemName] = useState(name);
    const [link, setLink] = useState(itemLink);
    const [image, setImage] = useState(itemImage);
    const [quantity, setQuantity] = useState(itemQuantity);
    const [purchased, setPurchased] = useState(itemPurchased);
    const handleDataChange = (id: string) => {
      onDataChange(id, { itemName, link, image, purchased, quantity });
    };
    return (
<Card className="py-4 bg-slate-800 mb-10 rounded-xl">
      <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
        <p className="text-tiny uppercase font-bold text-white">{itemName}</p>
        <a className="text-blue-700 underline text-default-500" href={link}>Link</a>
      </CardHeader>
      <CardBody className="overflow-visible py-2 pl-2">
        <Image
          alt="Card background"
          className="object-cover rounded-xl"
          src={image}
          width={270}
          height={270}
          loader={imageLoader}
        />
        <div className="flex">
          <h1 className="pr-2">Purchased</h1>
          <Input type="checkbox" labelPlacement="outside-left" checked={purchased} onChange={(e) => {setPurchased(e.target.checked);}} onBlur={() => handleDataChange(id)}/>
        </div>
        <p className="text-tiny uppercase font-bold text-white">Quantity: {quantity}</p>
      </CardBody>
    </Card>
  );
  }