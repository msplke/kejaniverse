import { createHmac } from "crypto";
import { eq } from "drizzle-orm";

import { env } from "~/env";
import { db } from "~/server/db";
import { payment, tenant, unit } from "~/server/db/schema";

interface PaystackWebhookEvent {
  event: "charge.success" | "paymentrequest.pending" | "paymentrequest.success";
  data: {
    id: string;
    status: string;
    reference: string;
    amount: number; // Amount in subunits (e.g. 1000 (Paystack) = 10.00 (actual))
    paid_at: string; // UTC date string
    subaccount: Record<string, unknown>;
    metadata: {
      unitId: string;
    };
  };
}

const defaultResponse = new Response("OK", { status: 200 });
const secret = env.PAYSTACK_LIVE_SECRET_KEY;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");

  if (hash !== req.headers.get("x-paystack-signature")) {
    return new Response("Invalid signature", { status: 401 });
  }

  const body = JSON.parse(rawBody) as PaystackWebhookEvent;
  console.log("Body:");
  console.log(body);

  const event = body.event;
  if (event !== "charge.success") {
    // Will handle other events in the future
    return defaultResponse;
  }

  await handleChargeSuccess(body.data);
  return defaultResponse;
}

/**
 * Fetches the unit and tenant details from the database, inserts a payment record
 * and updates the tenant's cumulative rent paid.
 * @param data The data from the `charge.success` webhook event
 */
async function handleChargeSuccess(data: PaystackWebhookEvent["data"]) {
  try {
    await db.transaction(async (tx) => {
      // Get unit and tenant details
      const unitResult = await tx
        .select({ id: unit.id, occupied: unit.occupied })
        .from(unit)
        .where(eq(unit.id, data.metadata.unitId));

      const currentUnit = unitResult[0];
      if (!currentUnit) {
        throw new Error("Unit not found: " + data.metadata.unitId);
      }

      if (currentUnit.occupied === false) {
        throw new Error("Unit is not occupied: " + currentUnit.id);
      }

      const tenantResult = await tx
        .select()
        .from(tenant)
        .where(eq(tenant.unitId, currentUnit.id))
        .limit(1);

      const currentTenant = tenantResult[0];
      if (!currentTenant) {
        throw new Error("Tenant not found: " + currentUnit.id);
      }

      // Paystack uses subunits, so we divide the amount by 100 to get the actual amount
      const amount = data.amount / 100;

      // Insert payment record
      await tx.insert(payment).values({
        referenceNumber: data.reference,
        amount: amount,
        paymentMethod: "mpesa",
        paidAt: new Date(data.paid_at),
        paymentReference: data.reference,
        unitId: currentUnit.id,
        tenantId: currentTenant.id,
      });

      // Update tenant's cumulative rent paid
      await tx
        .update(tenant)
        .set({
          cumulativeRentPaid: currentTenant.cumulativeRentPaid + amount,
        })
        .where(eq(tenant.id, currentTenant.id));
    });
  } catch (error) {
    console.error("Error handling charge success:", error);
  }
}
