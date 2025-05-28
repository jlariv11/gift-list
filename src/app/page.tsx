"use client"

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect} from "react";

export default function Home() {

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if(searchParams){
      if(searchParams.has("ownerID")){
        router.push(`/CreateList?ownerID=${searchParams.get("ownerID")}`);
      }else if(searchParams.has("shareID")){
        router.push(`/ShareList?shareID=${searchParams.get("shareID")}`);
      }
    }
  }, [searchParams])

  return(
      <>
      </>
  )
}
