import React from "react";
import cookie from "cookie";
import Auth from "@/lib/auth";
import { redirect } from "next/navigation";
import { db } from "@/lib/db";
import { PlanProvider } from "@/lib/context/PlanContext";
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
  if (!user) {
    redirect("/");
  }
  let userId = user.userId;
  const profile = await db?.profile.findFirst({ where: { userId: userId } });
  return (
    <PlanProvider
      children={children}
      hasEnterprisePlan={profile?.plan === "enterprise_user"}
      hasProPlan={profile?.plan === "pro_user"}
    ></PlanProvider>
  );
}
