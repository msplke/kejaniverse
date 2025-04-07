"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { Check, Loader, Plus, Trash } from "lucide-react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

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
import { Separator } from "~/components/ui/separator";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { createProperty } from "~/server/actions";
import {
  CreatePropertyFormContext,
  CreatePropertyFormDispatchContext,
  CreateUnitTypeFormSchema,
  type CreatePropertyFormContextType,
  type CreateUnitTypeFormData,
} from "../context";

function CreateUnitTypeForm() {
  const router = useRouter();
  const { propertyName, bankAccountNumber, unitTypes } = useContext(
    CreatePropertyFormContext,
  );
  const setFormData = useContext(CreatePropertyFormDispatchContext);

  const { mutate: server_createProperty, isPending } = useMutation({
    mutationFn: async (data: CreatePropertyFormContextType) =>
      createProperty(data),

    onSuccess: ({ propertyId, propertyName }) => {
      toast.success(`Success. Property "${propertyName}" created.`);
      router.push(`/properties/${propertyId}`);
    },

    onError: () => {
      toast.error("Failed. Please try again.");
    },
  });

  const form = useForm<CreateUnitTypeFormData>({
    resolver: zodResolver(CreateUnitTypeFormSchema),
    defaultValues: {
      unitType: "Single-room",
      rentPrice: 0,
    },
  });

  function onSubmit(values: CreateUnitTypeFormData) {
    setFormData((prev) => {
      const unitTypeExists = prev.unitTypes.find(
        (v) =>
          v.unitType === values.unitType && v.rentPrice === values.rentPrice,
      );

      if (unitTypeExists) {
        toast.error(
          `${unitTypeExists.unitType} with rent Ksh.${unitTypeExists.rentPrice} already exists in the list`,
        );
        return prev;
      }

      const unitTypes = [...prev.unitTypes, values];
      return { ...prev, unitTypes };
    });
    form.reset();
    form.setFocus("unitType");
  }

  function onDone() {
    server_createProperty({ propertyName, bankAccountNumber, unitTypes });
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="max-w-xl space-y-8"
      >
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
                    {CreateUnitTypeFormSchema.shape.unitType.options.map(
                      (option) => (
                        <SelectItem key={option} value={option}>
                          {option}
                        </SelectItem>
                      ),
                    )}
                  </SelectContent>
                </Select>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="rentPrice"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Rent Price</FormLabel>
              <FormControl>
                <Input type="number" step={100} placeholder="3500" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="my-4 flex gap-4">
          <Button type="submit" variant={"secondary"}>
            <Plus className="h-4 w-4" />
            <span>Add</span>
          </Button>
          <Button
            type="button"
            disabled={unitTypes.length === 0}
            onClick={onDone}
          >
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
        </div>
      </form>
    </Form>
  );
}

function UnitTypesTable({
  unitTypes,
}: {
  unitTypes: CreateUnitTypeFormData[];
}) {
  const setFormData = useContext(CreatePropertyFormDispatchContext);

  function deleteUnitType(unitType: CreateUnitTypeFormData) {
    setFormData((prev) => {
      const unitTypes = prev.unitTypes.filter(
        (prevUnitType) =>
          !(
            prevUnitType.unitType === unitType.unitType &&
            prevUnitType.rentPrice === unitType.rentPrice
          ),
      );
      return { ...prev, unitTypes };
    });
  }
  return (
    <div>
      <h2 className="text-lg font-semibold">Unit Types</h2>
      <Table className="max-w-[500px]">
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Unit Type</TableHead>
            <TableHead className="text-right">Rent Price</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {unitTypes.map((unitType) => (
            <TableRow key={`${unitType.unitType}-${unitType.rentPrice}`}>
              <TableCell className="font-medium">{unitType.unitType}</TableCell>
              <TableCell className="text-right">{unitType.rentPrice}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant={"ghost"}
                  size={"icon"}
                  onClick={() => deleteUnitType(unitType)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function Page() {
  const router = useRouter();

  const { bankAccountNumber, propertyName, unitTypes } = useContext(
    CreatePropertyFormContext,
  );

  useEffect(() => {
    if (!bankAccountNumber || !propertyName) {
      router.push("/properties/new");
    }
  }, [router, bankAccountNumber, propertyName]);

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2">
        <UnitTypesTable unitTypes={unitTypes} />
        <Separator className="md:hidden" />
        <CreateUnitTypeForm />
      </div>
    </div>
  );
}
