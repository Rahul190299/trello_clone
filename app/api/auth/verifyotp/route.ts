import { NextApiRequest, NextApiResponse } from "next";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import Auth from "@/lib/auth";

export  async function POST(req: NextRequest) {
  try {
    let bSuccess: boolean = false;
    let strMessage: string = "";
    let strRedirect: string = "/";
    if (req.method != "POST") {
      return NextResponse.json(
        { message: "only post request allowed" },
        { status: 405 }
      );
    }

    const { email, otp } = await req.json();
    if (!email || !otp) {
      return NextResponse.json(
        { message: "missing parameters" },
        { status: 400 }
      );
    }
    const user = await db.profile.findUnique({
      where: { userId: email },
    });
    if (!user) {
      return NextResponse.json({ message: "user does not exits" });
    }
    if (user.isVerified) {
      bSuccess = true;
      strMessage = "user already verified";
    } else {
      const userOtp = user.otp;
      if (otp === userOtp) {
        if(new Date(Date.now()) < user.otpExpiresAt){
          //lets update user status in db
          await db.profile.update({
            where : {userId : email},
            data : { isVerified : true}
          });
          bSuccess = true;
          strMessage = "otp verified successfully";
        }
        else{
          strMessage = "otp expired";
        }
        
      } else {
        strMessage = "otp verification failed";
      }
    }
    if (bSuccess == true) {
      const res = {
        result: bSuccess,
        message: strMessage,
        redirect: strRedirect,
      };
      const response = NextResponse.json(res,{status : 200});
      const token = Auth.generateToken(user.id, user.email);
      Auth.setTokenCookie(response, token);
      return response;
    } else {
      const res = {
        result: bSuccess,
        message: strMessage,
        redirect: strRedirect,
      };
      return NextResponse.json(res,{status : 200});
    }
  } catch (error) {
    return NextResponse.json(
      { result: false, message: "Internal server error", redirect: "/sign-in" },
      { status: 500 }
    );
  }
}
