
import { z } from 'zod';
import { db } from '@/lib/db';
import Auth from '@/lib/auth';
import crypto from 'crypto';
import { Nodemailer } from '@/lib/nodemailer';
import { NextRequest, NextResponse } from 'next/server';
// Define the input schema using Zod
const SignupSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
  username : z.string(),
});

// Define the handler
export  async function POST(req: NextRequest) {
  // Allow only POST requests
  if (req.method !== 'POST') {
    return NextResponse.json({ message: 'Only POST requests allowed' },{status : 405});
  }

  try {
    // Validate input using Zod
    let strError : string = "";
    let bGoAhead : boolean = true;
    const { email, password ,username} = SignupSchema.parse(await req.json());

    // Check if user already exists
    const existingUser = await db.profile.findUnique({
      where: { userId : email },
    });

    if (existingUser) {
      return NextResponse.json({ message: 'User already exists' },{status : 400});
    }
    //generate salt 
    const salt = await Auth.getSalt();

    // Hash the password
    const hashedPassword = await  Auth.signWithJWT(password,salt);
    if(hashedPassword){
      const newUser = await db.profile.create({
        data: {
          email,
          password: hashedPassword,
          userId : email,
          name : username,
          imageUrl : "",
          isVerified : false,
          otp : "",
          otpExpiresAt: new Date(Date.now() + 10 * 60 * 1000),  
          salt : salt,
        },
      });
      if(newUser){
        //lets send otp to verify mail
        const otp = crypto.randomInt(100000, 999999);
        const bRes = await Nodemailer.SendMail(email,otp);
        if(bRes){
          await db.profile.update({
            where: {userId: email },
            data: { otp: otp.toString() ,otpExpiresAt : new Date(Date.now() + 5*60*1000) }, //add 5min expiry for otp
          });
          strError = "otp sent successfully";
        }
        else{
          bGoAhead = false;
        }
        
      }else{
        return NextResponse.json({message : 'failed to sign up user'},{status : 500});
      }

      return NextResponse.json({ message: 'User created successfully', redirect: '/verifyotp' },{status : 200});
      
      
    }
    else{
      return NextResponse.json({message : "failed to hash password"},{status : 500});
    }

    
  } catch (error) {
    // Handle Zod validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: error.message },{status : 500});
    }
    // Handle other errors
    return NextResponse.json({ message: 'Internal Server Error' },{status : 500});
  }
}
