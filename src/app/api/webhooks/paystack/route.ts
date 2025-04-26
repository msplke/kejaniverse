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
      custom_fields: {
        display_name: string;
        variable_name: string;
        value: string;
      }[];
      unitId: string;
    };
  };
}

const defaultResponse = new Response("OK", { status: 200 });
const secret = env.PAYSTACK_SECRET_KEY;

export async function POST(req: Request) {
  const rawBody = await req.text();
  const hash = createHmac("sha512", secret).update(rawBody).digest("hex");

  if (hash !== req.headers.get("x-paystack-signature")) {
    return new Response("Invalid signature", { status: 401 });
  }

  const body = JSON.parse(rawBody) as PaystackWebhookEvent;
  // console.log("Body:");
  // console.log(body);

  const event = body.event;
  if (event !== "charge.success") {
    // Will handle other events in the future
    return defaultResponse;
  }
  console.log(body.data.metadata.custom_fields);
  await handleChargeSuccess(body.data);
  return defaultResponse;
}

/**
 * Fetches the unit and tenant details from the database, inserts a payment record
 * and updates the tenant's cumulative rent paid.
 * @param data The data from the `charge.success` webhook event
 */
async function handleChargeSuccess(data: PaystackWebhookEvent["data"]) {
  let unitId: string;
  if (data.metadata.custom_fields?.length === 1) {
    unitId = data.metadata.custom_fields[0]!.value;
  } else if (data.metadata.unitId) {
    unitId = data.metadata.unitId;
  } else {
    throw new Error("Unit ID not found in metadata");
  }

  await updateDbOnRentPayment(unitId, data).catch((err) => {
    console.error("Error updating database on rent payment:", err);
  });
}

async function updateDbOnRentPayment(
  unitId: string,
  data: PaystackWebhookEvent["data"],
) {
  await db.transaction(async (tx) => {
    const unitResult = await tx
      .select({ id: unit.id, occupied: unit.occupied })
      .from(unit)
      .where(eq(unit.id, unitId));

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
    // Currently, the type of amount is `integer` in the schema, hence the rounding,
    // but it should be of type `decimal` in the future
    // to avoid rounding errors.
    const amount = Math.round(data.amount / 100);

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
}
