import { NextApiRequest, NextApiResponse } from "next";
import { z } from "zod";
import { db } from "@/lib/db";

import crypto from "crypto";

import { Nodemailer } from "@/lib/nodemailer";
import { NextRequest, NextResponse } from "next/server";
// Define the input schema using Zod
const SignupSchema = z.object({
  email: z.string().email("Invalid email address"),
});

export  async function POST(
  req: NextRequest
) {
  try {
    let strError: string = "";
    let bRes: boolean = false;
    if (req.method != "POST") {
      return NextResponse.json({ message: "only POST request allowed" },{status : 405});
    }

    const { email } = SignupSchema.parse(await req.json());

    // Check if user already exists
    const existingUser = await db.profile.findUnique({
      where: { userId: email },
    });

    if (existingUser) {
      if (existingUser.isVerified) {
        strError = "user already verified go to dashboard";
      } else {
        const otp = crypto.randomInt(100000, 999999);
        const bResult: boolean = await Nodemailer.SendMail(
          email,
          otp
        );
        if (bResult) {
          await db.profile.update({
            where: {userId: email },
            data: { otp: otp.toString() , otpExpiresAt : new Date(Date.now() + 5*60*1000) },//add 5 min expiry to otp
            
          });
          strError = "otp sent successfully";
          bRes = true;
        } else {
          strError = "Failed to send otp";
        }
      }
    } else {
      strError = "User does not exits with this email";
    }

    return NextResponse.json({ message: strError, res: bRes },{status : 200});
  } catch (error) {
    return NextResponse.json({ message: "Internal Server Error" },{status : 500});
  }
}
