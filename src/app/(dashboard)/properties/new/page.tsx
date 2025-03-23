"use client";

import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { LoaderCircle, Plus } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
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
import { createProperty } from "~/server/actions";

const FormSchema = z.object({
  propertyName: z
    .string()
    .nonempty("Property name is required")
    .min(4, {
      message: "Property name must be at least 4 characters long",
    })
    .max(64, { message: "Name can't be more than 64 characters" }),
  bankAccountNo: z
    .string()
    .nonempty("Bank account number is required")
    .min(8, {
      message: "Bank account number must be at least 8 characters long",
    })
    .max(32, {
      message: "Bank account number can't be more than 32 characters",
    }),
});

export type CreatePropertyFormData = z.infer<typeof FormSchema>;

function ProfileForm() {
  const router = useRouter();

  const form = useForm<CreatePropertyFormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      propertyName: "",
      bankAccountNo: "",
    },
  });

  const { mutate: server_createProperty, isPending } = useMutation({
    mutationFn: async (data: CreatePropertyFormData) => createProperty(data),

    onSuccess: (id) => {
      toast.success(`Success. Property created with id: ${id}`);
      form.reset();
      router.push(`/properties/${id}`);
    },

    onError: () => {
      toast.error("Failed. Please try again.");
    },
  });

  const onSubmit = (data: CreatePropertyFormData) => {
    server_createProperty(data);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          name="bankAccountNo"
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
        <Button type="submit" disabled={isPending}>
          {isPending ? (
            <>
              <LoaderCircle className="h-4 w-4 animate-spin" />
              Creating...
            </>
          ) : (
            <>
              <Plus className="h-4 w-4" />
              Create
            </>
          )}
        </Button>
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
