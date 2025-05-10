"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import type { Table } from "@tanstack/react-table";
import { Filter } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import { Button } from "~/components/ui/button";
import { Form } from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { DateRangeFilter } from "./date-range-filter";
import { FilterActions } from "./filter-actions";
import { SelectFilter } from "./select-filter";

const filterFormSchema = z.object({
  dateRange: z
    .object({
      from: z.date().optional(),
      to: z.date().optional(),
    })
    .refine(
      (data) => {
        // If both dates exist, ensure "to" is not before "from"
        if (data.from && data.to) {
          return data.to >= data.from;
        }
        // If only one or none of the dates exist, validation passes
        return true;
      },
      {
        message: "End date cannot be earlier than start date",
        path: ["to"],
      },
    ),
  unitType: z.string(),
  unitStatus: z.string(),
});

type FilterFormValues = z.infer<typeof filterFormSchema>;

export type FilterPopoverOptions<TData> = {
  dateRangeKey?: keyof TData & string;
  unitTypeKey?: keyof TData & string;
  unitStatusKey?: keyof TData & string;
};

export function FilterPopover<TData>({
  table,
  options,
}: {
  table: Table<TData>;
  options: FilterPopoverOptions<TData>;
}) {
  const defaultValues: FilterFormValues = {
    dateRange: {
      from: undefined,
      to: new Date(),
    },
    unitType: "",
    unitStatus: "",
  };

  const { dateRangeKey, unitTypeKey, unitStatusKey } = options;

  // Initialize the form with react-hook-form
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues,
  });

  // Reset the entire form
  function resetAll() {
    form.reset(defaultValues);

    // Clear all filters
    if (dateRangeKey) {
      table.getColumn(dateRangeKey)?.setFilterValue(undefined);
    }
    if (unitTypeKey) {
      table.getColumn(unitTypeKey)?.setFilterValue(undefined);
    }
    if (unitStatusKey) {
      table.getColumn(unitStatusKey)?.setFilterValue(undefined);
    }
  }

  // Reset individual fields
  function resetDateRange() {
    if (dateRangeKey) {
      form.resetField("dateRange");
      table.getColumn("paidAt")?.setFilterValue(undefined);
    }
  }

  function resetActivityType() {
    if (unitTypeKey) {
      form.resetField("unitType");
      table.getColumn("unitType")?.setFilterValue(undefined);
    }
  }

  function resetStatus() {
    if (unitStatusKey) {
      form.resetField("unitStatus");
      table.getColumn("unitStatus")?.setFilterValue(undefined);
    }
  }

  function onSubmit(data: FilterFormValues) {
    console.log("Filter applied:", data);

    // Apply date range filter
    if (dateRangeKey) {
      if (data.dateRange.from || data.dateRange.to) {
        table
          .getColumn("paidAt")
          ?.setFilterValue([data.dateRange.from, data.dateRange.to]);
      } else {
        table.getColumn("paidAt")?.setFilterValue(undefined);
      }
    }

    // Apply unit type filter
    if (unitTypeKey) {
      if (data.unitType) {
        table.getColumn("unitType")?.setFilterValue(data.unitType);
      } else {
        table.getColumn("unitType")?.setFilterValue(undefined);
      }
    }

    // Apply status filter
    if (unitStatusKey) {
      if (data.unitStatus) {
        table.getColumn("unitStatus")?.setFilterValue(data.unitStatus);
      } else {
        table.getColumn("unitStatus")?.setFilterValue(undefined);
      }
    }
  }

  return (
    <div className="bg-yellow-50">
      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline">
            <Filter className="h-4 w-4" />
            Filter
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[380px] rounded-lg border-gray-200 p-0"
          align="end"
        >
          <ScrollArea className="max-h-[80vh]">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6 p-4"
              >
                <h3 className="text-lg font-medium">Filter</h3>
                {dateRangeKey && (
                  <DateRangeFilter
                    form={form}
                    from={"dateRange.from"}
                    to={"dateRange.to"}
                    onReset={resetDateRange}
                  />
                )}
                {unitTypeKey && (
                  <SelectFilter
                    form={form}
                    name="unitType"
                    title="Unit type"
                    onReset={resetActivityType}
                    options={[
                      { value: "bedsitter", label: "Bedsitter" },
                      { value: "single-room", label: "Single Room" },
                    ]}
                    renderValue={(value, options) => {
                      const option = options.find((opt) => opt.value === value);
                      if (!option) return "Select unit type";
                      return option.label;
                    }}
                  />
                )}
                {unitStatusKey && (
                  <SelectFilter
                    form={form}
                    name="unitStatus"
                    title="Unit Status"
                    onReset={resetStatus}
                    options={[
                      {
                        value: "Occupied",
                        label: "Occupied",
                        icon: (
                          <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                        ),
                      },
                      {
                        value: "Vacant",
                        label: "Vacant",
                        icon: (
                          <span className="mr-2 h-2 w-2 rounded-full bg-gray-500"></span>
                        ),
                      },
                    ]}
                    renderValue={(value, options) => {
                      const option = options.find((opt) => opt.value === value);
                      if (!option) return "Select status";
                      return (
                        <div className="flex items-center">
                          {option.icon}
                          {option.label}
                        </div>
                      );
                    }}
                  />
                )}
                <FilterActions
                  onReset={resetAll}
                  onApply={form.handleSubmit(onSubmit)}
                />
              </form>
            </Form>
          </ScrollArea>
        </PopoverContent>
      </Popover>
    </div>
  );
}
