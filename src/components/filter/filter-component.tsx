"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ScrollArea } from "@radix-ui/react-scroll-area";
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
  dateRange: z.object({
    from: z.date().optional(),
    to: z.date().optional(),
  }),
  unitType: z.string(),
  status: z.string(),
});

type FilterFormValues = z.infer<typeof filterFormSchema>;

export function FilterComponent() {
  const defaultValues: FilterFormValues = {
    dateRange: {
      from: undefined,
      to: undefined,
    },
    unitType: "",
    status: "",
  };

  // Initialize the form with react-hook-form
  const form = useForm<FilterFormValues>({
    resolver: zodResolver(filterFormSchema),
    defaultValues,
  });

  // Handle form submission
  function onSubmit(data: FilterFormValues) {
    console.log("Filter applied:", data);
  }

  // Reset the entire form
  function resetAll() {
    form.reset(defaultValues);
  }

  // Reset individual fields
  function resetDateRange() {
    form.resetField("dateRange");
  }

  function resetActivityType() {
    form.resetField("unitType");
  }

  function resetStatus() {
    form.resetField("status");
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
                <DateRangeFilter
                  form={form}
                  from={"dateRange.from"}
                  to={"dateRange.to"}
                  onReset={resetDateRange}
                />
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
                <SelectFilter
                  form={form}
                  name="status"
                  title="Status"
                  onReset={resetStatus}
                  options={[
                    {
                      value: "occupied",
                      label: "Occupied",
                      icon: (
                        <span className="mr-2 h-2 w-2 rounded-full bg-green-500"></span>
                      ),
                    },
                    {
                      value: "unoccupied",
                      label: "Unoccupied",
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
