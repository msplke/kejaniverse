import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import { FilterSection } from "~/components/filter/filter-section";
import { Icons } from "~/components/icons";
import { Button } from "~/components/ui/button";
import { Calendar } from "~/components/ui/calendar";
import { FormControl, FormField, FormItem } from "~/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { formatDate } from "~/lib/formatters";

interface DateRangeFilterProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  form: UseFormReturn<TFieldValues>;
  from: TName;
  to: TName;
  onReset: () => void;
}

export function DateRangeFilter<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ form, from, to, onReset }: DateRangeFilterProps<TFieldValues, TName>) {
  return (
    <FilterSection title="Date range" onReset={onReset}>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <span className="text-sm text-gray-500">From:</span>
          <FormField
            control={form.control}
            name={from}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-200 bg-white text-left font-normal"
                      >
                        <Icons.calendar />
                        {field.value ? formatDate(field.value) : "Select date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>
        <div className="space-y-1">
          <span className="text-sm text-gray-500">To:</span>
          <FormField
            control={form.control}
            name={to}
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className="w-full justify-start border-gray-200 bg-white text-left font-normal"
                      >
                        <Icons.calendar />
                        {field.value ? formatDate(field.value) : "Select date"}
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      initialFocus
                    />
                  </PopoverContent>
                </Popover>
              </FormItem>
            )}
          />
        </div>
      </div>
    </FilterSection>
  );
}
