//import { auth } from '@clerk/nextjs';

import { db } from "@/lib/db";
import { cookies } from "next/headers"; // To access cookies in server-side component
import cookie from "cookie";
import Auth from "@/lib/auth";

export const currentProfile = async (reqCookie : string | any = null) => {
  try {
    let userId = null;
    let user = null;
    let cookieStore = null;
    let cookieString = null;
    if(reqCookie){
      cookieString = reqCookie;
    }
    else{
      cookieStore = await cookies();
      cookieString = cookieStore?.get("Set-Cookie")?.value;
    }
    if (!cookieString) {
      return null;
    }
    const parsedCookies = cookie.parse(cookieString || "");
    user = Auth.verifySessionToken(parsedCookies.token);
    if(!user){
        return null;
    }
    userId = user.id;
    const profile = await db.profile.findUnique({
      where: {
        id: userId,
      },
    });
    return profile;
  } catch (error) {
    return null;
  }
};
