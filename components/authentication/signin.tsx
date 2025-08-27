"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { toast } from "sonner";

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
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useSessionStore } from "@/store/sessionstore";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string(),
});

export function SignInForm() {
  const setEmail = useSessionStore((state) => state.setEmail);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {},
  });

  const router = useRouter();
  async function onSubmit(values: z.infer<typeof formSchema>) {
    try {
      console.log("in signin");
      const loadId = toast.loading("Signing in...");
      const result = await fetch("/api/auth/signin", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      });
      toast.dismiss(loadId);
      const res = await result.json();
      console.log(res);
      const redirectUrl = res.redirectUrl?.toString();
      const strMessage = res.message?.toString();

      switch (result.status) {
        case 200:
          if (redirectUrl === "/") {
            router.push(redirectUrl);
            toast.success("Signed in");
          } else {
            router.push(redirectUrl);
            toast.message(strMessage);
          }
          break;
        case 400:
          toast.error(strMessage);
          break;
        case 500:
          toast.error("Internal server error please try again");
          break;
      }
    } catch (error) {}
    console.log(values);
  }

  return (
    <section className="wrapper relative flex min-h-screen items-center justify-center overflow-hidden antialiased z-0">
      <motion.div
        initial={{ y: -40, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{
          duration: 0.5,
          ease: "easeInOut",
          type: "spring",
          damping: 10,
        }}
        className="flex w-full flex-col justify-start gap-12 rounded-2xl bg-primary/5 p-8 md:max-w-[30vw]"
      >
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                     className = "focus:ring-none border-none bg-primary/5 focus:outline-none"
                      placeholder="email"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e);
                        setEmail(e.target.value);
                      }}
                    />
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" className = "focus:ring-none border-none bg-primary/5 focus:outline-none" placeholder="password" {...field} />
                  </FormControl>

                  <FormMessage className="text-red-500" />
                </FormItem>
              )}
            />
           
           <Button
            size={'lg'}
            variant={'branding'}
            className=" w-full"
          >
            Login
          </Button>
           
          </form>
        </Form>
      </motion.div>
      <div className="absolute -bottom-[16rem] -z-[20] size-[24rem] overflow-hidden rounded-full bg-gradient-to-t from-blue-400 to-blue-700 blur-[16em]" />
    </section>
  );
}
