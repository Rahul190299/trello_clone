"use client"
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSessionStore } from "@/store/sessionstore";
import { useRouter } from "next/navigation";
import {toast} from 'sonner';
const formSchema = z.object({
    otp: z.string(),
  });
  
  export function VerifyOtp() {
    const email = useSessionStore((state) => state.email);
    const router = useRouter();
    const form = useForm<z.infer<typeof formSchema>>({
      resolver: zodResolver(formSchema),
      defaultValues: {},
    });

    async function fnSendOtp(){
      try{
        console.log("in fnsendotp" + email);
        const inputObj = {email};
        console.log(inputObj);
        
        const result = await fetch('/api/auth/sendotp',{
          method : "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inputObj),
        }); 
        switch(result.status){
          case 200:
            const res = await result.json();
            if(res.bResult){
              toast.success("otp send successfully at "+email);
            }
            else{
              toast.error(res.strError);
            }
            break;
          default:
            toast.message("Failed to send otp please try again");
            break;

        }
        
      }catch(error){

      }
    }
  
    async function onSubmit(values: z.infer<typeof formSchema>) {
      try{
        console.log(values);
        const inputObj = {...values,email};
        console.log(inputObj);
        const loadId = toast.loading('Verifying otp, please wait...');
        const result = await fetch('/api/auth/verifyotp',{
          method : "POST",
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(inputObj),
        }); 
        toast.dismiss(loadId);
        switch(result.status){
          case 200:
            const res = await result.json();
            if(res.bSuccess){
              router.push("/");
              toast.success('Verified otp successfully');
            }
            break;
          default: 
            break;
        }
      }catch(error){
        console.log(error);
      }
    }
  
    return (
      <section className="wrapper relative flex min-h-screen items-center justify-center overflow-hidden antialiased ">
        <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
          type: "spring",
          damping: 10,
        }}
        className="flex w-full flex-col justify-between gap-12 rounded-2xl bg-primary/5 p-8 md:max-w-[30vw]"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Enter otp </FormLabel>
                  <FormControl>
                    <Input placeholder={`Enter otp here send at ${email}`} {...field} />
                  </FormControl>
  
                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
            <Button size={'lg'}
            variant={'branding'}
            className=" w-full"
             type="submit">Verify</Button>
            
          </form>
        </Form>
        <div>
        <Button
        size={'lg'}
        variant={'branding'}
        className=" w-full"
        onClick={fnSendOtp}>Send otp</Button>
        </div>
      </motion.div>
      </section>
      
    );
  }