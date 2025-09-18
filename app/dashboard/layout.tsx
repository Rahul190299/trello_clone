import React from "react";
import cookie from 'cookie';
import Auth from "@/lib/auth";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  //const cookieStore = cookies();
  //@ts-ignore
  const cookieStore = await cookies();
  const cookieString = cookieStore.get("Set-Cookie")?.value;
  let user = null;
  if (cookieString) {
    const parsedCookies = cookie.parse(cookieString || "");
    user = Auth.verifySessionToken(parsedCookies.token);
  }
}
