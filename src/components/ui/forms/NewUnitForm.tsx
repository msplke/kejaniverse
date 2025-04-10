"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import type { InferSelectModel } from "drizzle-orm";
import { Check, Loader } from "lucide-react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { addUnit } from "~/server/actions";
import { type unitType } from "~/server/db/schema";

type NewUnitFormProps = {
  unitTypes: InferSelectModel<typeof unitType>[];
  propertyId: string;
};

const formSchema = z.object({
  unitName: z.string().min(2).max(50),
  unitType: z.string().min(2).max(50),
});

export function NewUnitForm({ unitTypes, propertyId }: NewUnitFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      unitName: "",
      unitType: unitTypes[0]?.id ?? "",
    },
  });

  const { mutate: server_addUnit, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) =>
      addUnit(data.unitName, data.unitType, propertyId),

    onSuccess: () => {
      toast.success(`Success. Unit created.`);
    },

    onError: () => {
      toast.error("Failed. Please try again.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    server_addUnit(values);
    form.reset();
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="unitName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Name</FormLabel>
              <FormControl>
                <Input placeholder="A1" {...field} />
              </FormControl>
              <FormDescription>
                This is an identifier for the unit.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="unitType"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit Type</FormLabel>
              <FormControl>
                <Select
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {unitTypes.map((u) => (
                      <SelectItem key={u.id} value={u.id}>
                        {`${u.unitType} - ${u.rentPrice}`}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={unitTypes.length === 0}>
          {isPending ? (
            <>
              <Loader className="h-4 w-4 animate-spin" />
              <span>Creating...</span>
            </>
          ) : (
            <>
              <Check className="h-4 w-4" />
              <span>Done</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
