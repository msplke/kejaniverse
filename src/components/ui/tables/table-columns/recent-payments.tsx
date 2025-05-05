"use client";

import { type ColumnDef } from "@tanstack/react-table";

import { DataTableColumnHeader } from "~/components/ui/tables/data-table-column-header";
import { formatCurrency } from "~/lib/formatters";

export type Payment = {
  referenceNumber: string;
  amount: number;
  paidAt: Date;
  paymentMethod: "mpesa" | "bank_transfer";
  tenantName: string;
  unitName: string;
};

export const recentPaymentsTableColumns: ColumnDef<Payment>[] = [
  {
    accessorKey: "tenantName",
    header: ({ column }) => (
      <DataTableColumnHeader title="Tenant" column={column} />
    ),
    enableHiding: false,
  },
  {
    accessorKey: "unitName",
    header: "Unit",
    enableHiding: false,
  },
  {
    accessorKey: "paidAt",
    header: "Date",
    cell: ({ row }) => {
      const date = new Date(row.getValue("paidAt"));
      const options: Intl.DateTimeFormatOptions = {
        year: "numeric",
        month: "short",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      };
      const formattedDate = date.toLocaleDateString("en-US", options);
      return <span>{formattedDate}</span>;
    },
    enableHiding: false,
  },
  {
    accessorKey: "amount",
    header: "Amount Paid",
    cell: ({ row }) => {
      const cumulativeRentPaid = parseFloat(row.getValue("amount"));
      const formatted = formatCurrency(cumulativeRentPaid);
      return <span className="text-right">{formatted}</span>;
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
  //             <DropdownMenuItem>View full payment info</DropdownMenuItem>
  //           </DropdownMenuGroup>
  //         </DropdownMenuContent>
  //       </DropdownMenu>
  //     );
  //   },
  //   enableHiding: false,
  // },
];
