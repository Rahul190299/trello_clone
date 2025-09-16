//@ts-ignore
import bcrypt from "bcryptjs";
//@ts-ignore
import jwt from "jsonwebtoken";
import cookie from "cookie";
import { NextRequest, NextResponse } from "next/server";
const JWT_SECRET = process.env.JWT_SECRET || "your_jwt_secret"; // Store this in .env

export default class Auth {
  public static async getSalt(): Promise<string | null> {
    try {
      const salt = await bcrypt.genSalt(10);
      return salt;
    } catch (error) {
      return null;
    }
  }
  public static async signWithJWT(
    password: string,
    salt: string | null
  ): Promise<string | null> {
    if (salt != null) {
      try {
        return await bcrypt.hash(password, salt);
      } catch (error) {
        console.log(error);
        return null;
      }
    }
    return null;
  }

  public static async comparePassword(
    enteredPass: string,
    hashedPassword: string
  ): Promise<boolean | null> {
    try {
      return await bcrypt.compare(enteredPass, hashedPassword);
    } catch (error) {
      console.log(error);
      return null;
    }
  }

  public static generateToken(userId: string, email: string ,username :string = "" ): string | null {
    try {
      // Create a JWT
      const token = jwt.sign(
        { id: userId, email: email , username : username}, // Payload
        JWT_SECRET,
        { expiresIn: "1d" } // Token expiration time
      );
      return token;
    } catch (error) {
      return null;
    }
  }

  public static verifySessionToken(session: any): any {
    let res = null;
    try {
      const decoded = jwt.verify(session, JWT_SECRET);
      if (decoded) {
        res = decoded;
        // Refresh the session cookie by resetting its expiration to 1 hour
        Auth.setTokenCookie(res, decoded); // No need to regenerate the token

        return decoded; // Return the decoded token data (user info)
      }
    } catch (error) {}
    return res;
  }

  public static setTokenCookie(res: NextResponse, token: string | null) {
    try {
      if (token != null) {
        res.cookies.set(
          "Set-Cookie",
          cookie.serialize("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV !== "development", // Use HTTPS in production
            maxAge: 60 * 60,
            sameSite: "lax",
            path: "/",
          })
        );
      }
    } catch (error) {}
  }
}
