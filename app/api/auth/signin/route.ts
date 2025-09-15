import Auth from "@/lib/auth";
import { db } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";
import { z, ZodError } from "zod";

export async function POST(req: NextRequest) {
  try {
    const LogInSchema = z.object({
      email: z.string().email(),
      password: z.string(),
    });

    const { email, password } = LogInSchema.parse(await req.json());
    const user = await db.profile.findUnique({
      where: { userId: email },
    });

    if (!user) {
      return NextResponse.json(
        { message: "user not exist", redirectUrl: "/sign-up" },
        { status: 200 }
      );
    }
    if (user.isVerified) {
      //lets verify password
      const hashedPassword = await Auth.signWithJWT(password,user.salt);
      if (hashedPassword === user.password) {
        const response = NextResponse.json({
          message: "log in success",
          redirectUrl: "/",
        });
        const token = Auth.generateToken(user.id, user.email,user.name);
        Auth.setTokenCookie(response, token);
        return response;
      }
      else{
        return NextResponse.json({message : "Authentication failure please try again"},{status : 200})
      }
    } else {
        return NextResponse.json({message : "user not verified",redirectUrl : "/verifyotp"},{status : 200})
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return NextResponse.json(
        { message: error.message, redirectUrl: "/sign-in" },
        { status: 200 }
      );
    }
    return NextResponse.json(
      { message: "Error " + error, redirectUrl: "/sign-in" },
      { status: 500 }
    );
  }
}
