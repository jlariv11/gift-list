import Image, { ImageLoaderProps } from "next/image";
import React, { use, useState } from 'react';
import { Card, CardHeader, CardBody } from "@nextui-org/react";
import { ItemData } from "../SQLManager";
import { Input } from "@nextui-org/react"

interface ItemCardProps {
  id: string;
  name: string;
  itemLink: string;
  itemImage: string;
  itemQuantity: number;
  itemQuantityPurchased: number;
  itemPurchased: boolean;
  isShared: boolean;
  handleDelete: (id: string) => void;
  onDataChange: (id: string, data: ItemData) => void;
}

const imageLoader = ({ src }: ImageLoaderProps) => {
  return src;
};

export const ItemCard: React.FC<ItemCardProps> = ({ id, name, itemLink, itemImage, itemQuantity, itemQuantityPurchased, itemPurchased, isShared, handleDelete, onDataChange }) => {
  const [itemName, setItemName] = useState(name);
  const [link, setLink] = useState(itemLink);
  const [image, setImage] = useState(itemImage);
  const [quantity, setQuantity] = useState(itemQuantity);
  const [quantityPurchased, setQuantityPurchased] = useState(itemQuantityPurchased);
  const [purchased, setPurchased] = useState(itemPurchased);
  const [shared, setShared] = useState(isShared);
  const [imageLinkHidden, setLinkHidden] = useState(true);
  var lastSaveQtyPurchased = itemQuantityPurchased;
  const handleDataChange = (id: string) => {
    onDataChange(id, { itemName, link, image, purchased, quantityPurchased: (quantityPurchased - lastSaveQtyPurchased), quantity });
  };
  return (

    <div>
      <Card className="py-4 bg-slate-800 mb-10 rounded-xl">
        <CardHeader className="pb-0 pt-2 px-4 flex-col items-start">
          {isShared && (
            <div>
              <p className="text-tiny uppercase font-bold text-white">{itemName}</p>
              {link != "" && <a className="text-blue-700 underline text-default-500" href={link} target="_blank" rel="noopener noreferrer">Link</a>}
            </div>)}
          {!isShared && (
            <div>
              <Input className="pl-2 pb-2 text-black" type="text" placeholder="Item Name" defaultValue={itemName} onChange={(e) => setItemName(e.target.value)} onBlur={() => handleDataChange(id)} />
              <Input className="pl-2 pb-2 text-black" type="text" placeholder="Insert Link" defaultValue={link} onChange={(e) => setLink(e.target.value)} onBlur={() => handleDataChange(id)} />
            </div>)}

        </CardHeader>
        <CardBody className="overflow-visible py-2 pl-2 flex-wrap justify-center items-center">
          <Image className="pb-2" width={270} height={270} src={image} loader={imageLoader} alt="List Image" onClick={() => setLinkHidden(!imageLinkHidden)} />
          {shared && (
            <div>
              <div className="flex">
                <h1 className="pr-2 text-white whitespace-nowrap">Mark Purchased</h1>
                <Input type="checkbox" labelPlacement="outside-left" checked={purchased} onChange={(e) => { setPurchased(e.target.checked); }} onBlur={() => handleDataChange(id)} />
            </div>
            <div className="flex items-center">
              <h1 className="pr-2 text-white whitespace-nowrap" hidden={!purchased}>Amount to Purchase</h1>
              <Input type="number" max={quantity - lastSaveQtyPurchased} min={0} value={String(quantityPurchased)} onChange={(e) => setQuantityPurchased(Number(e.target.value))} onBlur={() => { handleDataChange(id)}} hidden={!purchased} />
            </div>
            <div className="flex items-center">
              <h1 className="pr-2 text-white" hidden={!purchased}>Quantity Purchased: {quantityPurchased}</h1>
            </div>
            <p className="text-tiny uppercase font-bold text-white">Quantity: {quantity}</p>
          </div>)}
          {!shared && (
            <div>
              <Input className="pl-2 text-black" type="text" placeholder="Insert Image Link" defaultValue={image == "/add_image.svg" ? "" : image} onChange={(e) => setImage(e.target.value)} onBlur={() => handleDataChange(id)} hidden={imageLinkHidden} />
              <div className="flex">
                <a className="pr-2 text-white">Quantity</a>
                <Input type="number" min={1} defaultValue={String(quantity)} onChange={(e) => setQuantity(Number(e.target.value))} onBlur={() => handleDataChange(id)} />
              </div>
            </div>)}

        </CardBody>
        {!shared && (<div className="pl-2 pt-2 text-red-700 font-bold hover:cursor-pointer" onClick={() => handleDelete(id)}>DELETE</div>)}
      </Card>
    </div>
  )
}