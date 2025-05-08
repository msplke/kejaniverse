import type { ReactNode } from "react";
import type { FieldPath, FieldValues, UseFormReturn } from "react-hook-form";

import { FormControl, FormField, FormItem } from "~/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { FilterSection } from "./filter-section";

interface SelectOption {
  value: string;
  label: string;
  icon?: ReactNode;
}

interface SelectFilterProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> {
  form: UseFormReturn<TFieldValues>;
  name: TName;
  title: string;
  onReset: () => void;
  options: SelectOption[];
  renderValue?: (value: string, options: SelectOption[]) => ReactNode;
}

export function SelectFilter<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  form,
  name,
  title,
  onReset,
  options,
  renderValue,
}: SelectFilterProps<TFieldValues, TName>) {
  return (
    <FilterSection title={title} onReset={onReset}>
      <FormField
        control={form.control}
        name={name}
        render={({ field }) => (
          <FormItem>
            <Select value={field.value} onValueChange={field.onChange}>
              <FormControl>
                <SelectTrigger className="w-full border-gray-200 bg-white">
                  <SelectValue placeholder={`Select ${title.toLowerCase()}`}>
                    {renderValue
                      ? renderValue(field.value, options)
                      : undefined}
                  </SelectValue>
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {options.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.icon ? (
                      <div className="flex items-center">
                        {option.icon}
                        {option.label}
                      </div>
                    ) : (
                      option.label
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FormItem>
        )}
      />
    </FilterSection>
  );
}
