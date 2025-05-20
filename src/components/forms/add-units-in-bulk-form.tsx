"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { type InferSelectModel } from "drizzle-orm";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";

import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import {
  Form,
  FormControl,
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
import { addUnitsGivenRange } from "~/server/actions/units";
import { type unitType } from "~/server/db/schema";

type AddUnitFormProps = {
  unitTypes: InferSelectModel<typeof unitType>[];
  propertyId: string;
};

const MAX_BULK_UNITS = 30;

const formSchema = z.object({
  start: z
    .number()
    .min(1)
    .max(MAX_BULK_UNITS - 1),
  end: z.number().min(2).max(MAX_BULK_UNITS),
  unitType: z.string().min(2).max(50),
});

export function AddUnitsInBulkForm({
  unitTypes,
  propertyId,
}: AddUnitFormProps) {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      start: 1,
      end: 2,
      unitType: unitTypes[0]?.id ?? "",
    },
  });

  const { mutate: server_addUnitsGivenRange, isPending } = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) =>
      addUnitsGivenRange(data.start, data.end, data.unitType, propertyId),

    onSuccess: (data) => {
      toast.success(`Success. ${data} units created.`);
    },

    onError: (err) => {
      console.log(err);
      if (err instanceof Error) {
        toast.error(err.message);
        return;
      }
      toast.error("Failed. Please try again later.");
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    server_addUnitsGivenRange(values);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="flex flex-row gap-4">
          <FormField
            control={form.control}
            name="start"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Start</FormLabel>
                <FormControl>
                  <Input placeholder="1" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="end"
            render={({ field }) => (
              <FormItem>
                <FormLabel>End</FormLabel>
                <FormControl>
                  <Input placeholder="2" type="number" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
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
              <Icons.loader className="h-4 w-4 animate-spin" />
              <span>Adding...</span>
            </>
          ) : (
            <>
              <Icons.plus className="h-4 w-4" />
              <span>Add</span>
            </>
          )}
        </Button>
      </form>
    </Form>
  );
}
