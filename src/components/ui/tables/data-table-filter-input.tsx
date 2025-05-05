import { type Table } from "@tanstack/react-table";

import { Input } from "~/components/ui/input";

interface DataTableFilterInputProps<TData> {
  table: Table<TData>;
  columnKey: string;
}

export function DataTableFilterInput<TData>({
  table,
  columnKey,
}: DataTableFilterInputProps<TData>) {
  const column = table.getColumn(columnKey);

  return (
    <div className="flex items-center">
      <Input
        placeholder={`Filter by ${columnKey}...`}
        value={(column?.getFilterValue() as string) ?? ""}
        onChange={(event) => column?.setFilterValue(event.target.value)}
        className="max-w-sm"
      />
    </div>
  );
}
