"use client";

import { useContext } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

import { Icons } from "~/components/icons";
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { type Bank } from "~/lib/validators/paystack";
import {
  CreatePropertyFormSchema,
  type CreatePropertyFormData,
} from "~/lib/validators/property";
import {
  CreatePropertyFormContext,
  CreatePropertyFormDispatchContext,
} from "./context";

export function CreatePropertyForm({ banks }: { banks: Bank[] }) {
  const router = useRouter();
  const currentFormData = useContext(CreatePropertyFormContext);
  const setFormData = useContext(CreatePropertyFormDispatchContext);

  const form = useForm<CreatePropertyFormData>({
    resolver: zodResolver(CreatePropertyFormSchema),
    defaultValues: {
      propertyName: currentFormData.propertyName ?? "",
      bankCode: currentFormData.bankCode ?? "",
      bankAccountNumber: currentFormData.bankAccountNumber ?? "",
    },
  });

  const onSubmit = (data: CreatePropertyFormData) => {
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
        <FormField
          control={form.control}
          name="bankCode"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Bank Name (For payouts)</FormLabel>
              <Select onValueChange={field.onChange} defaultValue={field.value}>
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose Bank" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {banks.map((bank, index) => (
                    <SelectItem key={`${bank.id}-${index}`} value={bank.code}>
                      {bank.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit">
          <Icons.arrowRight className="h-4 w-4" />
          <span>Next</span>
        </Button>
      </form>
    </Form>
  );
}
