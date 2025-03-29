"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowRight } from "lucide-react";
import { useForm } from "react-hook-form";

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
import {
  CreatePropertyFormSchema,
  SetFormValuesContext,
  type CreatePropertyFormData,
} from "./context";

export default function ProfileForm() {
  const router = useRouter();
  const setFormData = useContext(SetFormValuesContext);

  const form = useForm<CreatePropertyFormData>({
    resolver: zodResolver(CreatePropertyFormSchema),
    defaultValues: {
      propertyName: "",
      bankAccountNumber: "",
    },
  });

  const onSubmit = (data: CreatePropertyFormData) => {
    console.log(data);
    setFormData((prev) => ({
      ...prev,
      ...data,
    }));
    router.push("/properties/new/unit-types");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8"
      >
        <FormField
          name="propertyName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Property Name</FormLabel>
              <FormControl>
                <Input placeholder="Awesome Properties" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          name="bankAccountNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Account Number</FormLabel>
              <FormControl>
                <Input placeholder="12345678" {...field} />
              </FormControl>
              <FormDescription>
                This will be used to settle payments received from tenants.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          <ArrowRight className="h-4 w-4" />
          <span>Next</span>
        </Button>
      </form>
    </Form>
  );
}
