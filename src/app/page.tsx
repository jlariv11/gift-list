"use client"

import {useRouter, useSearchParams} from "next/navigation";
import {useEffect} from "react";
import LandingPage from "./LandingPage/page";

export default function Home() {

  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    if(searchParams){
      if(searchParams.has("owner")){
        router.push(`/CreateList?owner=${searchParams.get("owner")}`);
      }else if(searchParams.has("share")){
        router.push(`/ShareList?share=${searchParams.get("share")}`);
      }
    }
  }, [searchParams])

  return(
      <LandingPage />
  )
}
