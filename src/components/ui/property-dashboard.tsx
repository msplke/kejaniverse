import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "~/components/ui/table";
import { RECENT_PAYMENTS_LIMIT } from "~/server/db/constants";
import { payment } from "~/server/db/schema";

type Payment = {
  referenceNumber: string;
  amount: number;
  paidAt: Date;
  paymentMethod: "mpesa" | "bank_transfer";
  tenantName: string;
  unitName: string;
};

type PropertyDashboardData = {
  recentPayments: Payment[];
  totalRevenue: number;
  totalUnits: number;
  occupiedUnits: number;
};

export function PropertyDashboard({ data }: { data: PropertyDashboardData }) {
  return (
    <div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Total Revenue</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <p className="text-2xl font-bold">KES {data.totalRevenue}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Units Occupied</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center">
            <p className="text-2xl font-bold">
              {data.occupiedUnits}/{data.totalUnits}
            </p>
          </CardContent>
        </Card>
      </div>
      <div className="mt-8">
        <h2 className="mb-4 text-2xl font-bold">Recent Payments</h2>
        <RecentPaymentsTable payments={data.recentPayments} />
      </div>
    </div>
  );
}

function RecentPaymentsTable({ payments }: { payments: Payment[] }) {
  const dateFormatter = new Intl.DateTimeFormat("en-UK", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <Table>
      <TableCaption>
        {payments.length
          ? `The ${RECENT_PAYMENTS_LIMIT} most recent payment(s).`
          : "No payments yet."}
      </TableCaption>
      <TableHeader>
        <TableRow>
          <TableHead>Date</TableHead>
          <TableHead>Tenant</TableHead>
          <TableHead>Unit</TableHead>
          <TableHead>Amount</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {payments.map((payment, index) => (
          <TableRow key={index}>
            <TableCell>
              {dateFormatter.format(new Date(payment.paidAt))}
            </TableCell>
            <TableCell>{payment.tenantName}</TableCell>
            <TableCell>{payment.unitName}</TableCell>
            <TableCell>KES {payment.amount}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}
