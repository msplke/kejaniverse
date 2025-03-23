"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { createProperty } from "~/server/actions/actions";

const formSchema = z.object({
  propertyName: z.string().nonempty("Property name is required").min(2, {
    message: "Property name must be at least 2 characters long",
  }),
  bankAccountNo: z.string().nonempty("Bank account number is required").min(8, {
    message: "The bank account number must be at least 8 characters long",
  }),
});

function ProfileForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      propertyName: "",
      bankAccountNo: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    try {
      const id = await createProperty(
        values.propertyName,
        values.bankAccountNo,
      );
      if (id !== null) {
        console.log("Property created with id:", id);
      }
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="propertyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input placeholder="Awesome Properties" required {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="bankAccountNo"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account Number</FormLabel>
              <FormControl>
                <Input
                  type="password"
                  placeholder="12345678"
                  required
                  {...field}
                />
              </FormControl>
              <FormDescription>
                This will be used to settle payments received from tenants.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">Create</Button>
        {form.formState.isSubmitting && <div>Submitting...</div>}
      </form>
    </Form>
  );
}

export default function Page() {
  return (
    <div>
      <ProfileForm />
    </div>
  );
}
