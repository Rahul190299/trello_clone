//@ts-ignore
import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  service: "gmail",
  port: 8000,
  secure: false, // true for port 465, false for other ports
  auth: {
    user: process.env.NODE_MAILER_FROM_EMAIL,
    pass: process.env.NODE_MAILER_GMAIL_PASS,
  },
});

export class Nodemailer {
  // async..await is not allowed in global scope, must use a wrapper
  public static async SendMail(to: string, otp: number): Promise<boolean> {
    // send mail with defined transport object
    const from: string | undefined = process.env.NODE_MAILER_FROM_EMAIL;
    try {
      const info = await transporter.sendMail({
        from: from, // sender address
        to: to, // list of receivers
        subject: "Verify your email", // Subject line
        text: `Your OTP code is ${otp}. It will expire in 10 minutes.`, // plain text body
        // html body
      });
      return true;
    } catch (error) {
      return false;
    }

    //console.log("Message sent: %s", info.messageId);
    // Message sent: <d786aa62-4e0a-070a-47ed-0b0666549519@ethereal.email>
  }
}
