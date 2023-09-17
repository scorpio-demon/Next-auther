import { NextApiRequest, NextApiResponse } from "next";
import { nextAuthProviderHandler } from "@/next-auther";

export async function nextAuther(req:NextApiRequest,res:NextApiResponse){
   return nextAuthProviderHandler(req)
}