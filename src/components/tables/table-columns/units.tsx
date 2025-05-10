"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "~/components/tables/data-table-column-header";
import { formatCurrency } from "~/lib/formatters";

type UnitTableColumns = {
  id: string;
  name: string;
  unitType: string;
  occupied: boolean;
  rentPrice: number;
};

export const unitTableColumns: ColumnDef<UnitTableColumns>[] = [
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader title="Unit Name" column={column} />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "unitType",
    header: "Unit Type",
    enableHiding: false,
  },
  {
    accessorKey: "occupied",
    header: "Is Occupied",
    cell: ({ row }) => {
      const occupied = row.getValue("occupied");
      return <span>{occupied ? "Yes" : "No"}</span>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "id",
    header: "Unit ID",
    enableHiding: false,
  },
  {
    accessorKey: "rentPrice",
    header: ({ column }) => (
      <DataTableColumnHeader title="Rent price" column={column} />
    ),
    cell: ({ row }) => {
      const rentPrice = parseFloat(row.getValue("rentPrice"));
      const formatted = formatCurrency(rentPrice);
      return <span>{formatted}</span>;
    },
    enableHiding: false,
  },
  // {
  //   id: "actions",
  //   cell: ({ row }) => {
  //     const unit = row.original;
  //     return (
  //       <DropdownMenu>
  //         <DropdownMenuTrigger asChild>
  //           <Button variant="ghost" className="h-8 w-8 p-0">
  //             <span className="sr-only">Open menu</span>
  //             <MoreHorizontal className="h-4 w-4" />
  //           </Button>
  //         </DropdownMenuTrigger>
  //         <DropdownMenuContent align="end" className="p-2">
  //           <DropdownMenuGroup>
  //             <DropdownMenuItem
  //               onClick={async () => {
  //                 try {
  //                   await navigator.clipboard.writeText(unit.id);
  //                   toast.success("Unit ID copied to clipboard");
  //                 } catch (error) {
  //                   toast.error("Failed to copy Unit ID to clipboard");
  //                   console.error("Clipboard error:", error);
  //                 }
  //               }}
  //             >
  //               Copy unit ID
  //             </DropdownMenuItem>
  //             <DropdownMenuItem>Edit unit info</DropdownMenuItem>
  //             <DropdownMenuItem variant="destructive">
  //               Remove unit
  //             </DropdownMenuItem>
  //           </DropdownMenuGroup>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  //   enableHiding: false,
  // },
];
