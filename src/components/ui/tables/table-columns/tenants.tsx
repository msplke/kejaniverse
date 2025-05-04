"use client";

import Link from "next/link";
import type { ColumnDef } from "@tanstack/react-table";

import { Button } from "~/components/ui/button";
import { formatCurrency, formatDate } from "~/lib/formatters";
import { DataTableColumnHeader } from "../data-table-column-header";

type Tenant = {
  id: string;
  name: string;
  phoneNumber: string;
  email: string;
  moveInDate: string; // ISO date string
  moveOutDate: string | null; // ISO date string or null
  cumulativeRentPaid: number;
  unitName: string;
};

export const tenantTableColumns: ColumnDef<Tenant>[] = [
  {
    accessorKey: "name",
    header: "Name",
    enableHiding: false,
  },
  {
    accessorKey: "unitName",
    header: "Unit",
    enableHiding: false,
  },
  {
    accessorKey: "phoneNumber",
    header: "Phone",
  },
  {
    accessorKey: "email",
    header: "Email",
    cell: ({ row }) => {
      const email: string = row.getValue("email");
      return (
        <Button asChild variant="link" className="p-0">
          <Link href={`mailto:${email}`}>{email}</Link>
        </Button>
      );
    },
  },
  {
    accessorKey: "moveInDate",
    header: ({ column }) => (
      <DataTableColumnHeader title="Move In Date" column={column} />
    ),
    cell: ({ row }) => {
      const moveInDate = new Date(row.getValue("moveInDate"));
      const formatted = formatDate(moveInDate);
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "moveOutDate",
    header: "Move Out Date",
    cell: ({ row }) => {
      const moveOutDate: Date | null = row.getValue("moveOutDate");
      if (!moveOutDate) return <span>N/A</span>;
      const formatted = formatDate(new Date(moveOutDate));
      return <span>{formatted}</span>;
    },
  },
  {
    accessorKey: "cumulativeRentPaid",
    header: "Cumulative Rent Paid",
    cell: ({ row }) => {
      const cumulativeRentPaid = parseFloat(row.getValue("cumulativeRentPaid"));
      const formatted = formatCurrency(cumulativeRentPaid);
      return <span>{formatted}</span>;
    },
    enableHiding: false,
  },
  // {
  //   id: "actions",
  //   cell: () => {
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
  //             <DropdownMenuItem>Edit tenant info</DropdownMenuItem>
  //             <DropdownMenuItem variant="destructive">
  //               Remove tenant
  //             </DropdownMenuItem>
  //           </DropdownMenuGroup>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  //   enableHiding: false,
  // },
];
