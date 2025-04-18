import { z } from "zod";
import { zfd } from "zod-form-data";

import { env } from "~/env";
import { getTenantByUnitName, getUnitbyName } from "~/server/actions";

const schema = zfd.formData({
  sessionId: zfd.text(),
  serviceCode: zfd.text(),
  phoneNumber: zfd.text(),
  text: z.string(),
});

const chargeApiRequestSchema = z.object({
  amount: z.number().positive(),
  email: z.string().email(),
  mobile_money: z.object({
    phone: z.string().regex(/\+254\d{9}/),
    provider: z.literal("mpesa"),
  }),
});

type ChargeApiRequest = z.infer<typeof chargeApiRequestSchema>;

const responseHeaders = {
  "Content-Type": "application/text",
};

export async function POST(req: Request) {
  const validation = schema.safeParse(await req.formData());
  if (!validation.success) {
    console.error("Invalid form parameters", validation.error.format());
    return new Response("END Something went wrong. Please try again later.", {
      status: 200,
    });
  }

  console.log(validation.data);

  const { text } = validation.data;

  if (text === "") {
    return new Response("CON Kejaniverse Rent Payment\nEnter the unit name", {
      headers: responseHeaders,
    });
  }

  const prevResponses = text.split("*");

  console.log(`text=${text}`);
  console.log(`responses=${prevResponses.length}`);

  let response;

  if (prevResponses.length === 1) {
    // Validate that the unit exists
    const unitName = prevResponses[0]!;
    try {
      await getUnitbyName(unitName);
    } catch (error) {
      console.error(error);
      return new Response("END Unit not found. Please try again.", {
        headers: responseHeaders,
      });
    }

    // The unit exists, ask for the amount to pay
    response = "CON Enter the amount you want to pay.";
  } else if (prevResponses.length === 2) {
    // Validate that the amount is a number
    const amount = prevResponses[1]!;
    const validation = z.coerce.number().positive().safeParse(amount);
    if (!validation.success) {
      return new Response("END Invalid amount. Please try again.", {
        headers: responseHeaders,
      });
    }

    // The amount is valid, ask for the amount to be paid
    response =
      "CON Enter the M-Pesa number you want to pay with e.g. +254712345678";
  } else if (prevResponses.length === 3) {
    // Validate that the phone number is in the correct format
    const phoneNumber = prevResponses[2]!;
    const phoneNumberRegex = /^\+254\d{9}$/;
    if (!phoneNumberRegex.test(phoneNumber)) {
      return new Response("END Invalid phone number. Please try again.", {
        headers: responseHeaders,
      });
    }

    const amount = prevResponses[1];
    const unitName = prevResponses[0];
    // The phone number is valid, ask the user to confirm payment
    response = `CON Do you want to pay KES ${amount} for unit ${unitName}?\n1. Yes\n2. No`;
  } else if (prevResponses.length === 4) {
    // Validate the user's choice
    if (prevResponses[3] === "1") {
      // Get tenant for the unit
      const unitName = prevResponses[0]!;
      const tenant = await getTenantByUnitName(unitName);
      if (!tenant) {
        return new Response("END Tenant not found. Please try again.", {
          headers: responseHeaders,
        });
      }

      const tenantEmail = tenant.email;
      if (!tenantEmail) {
        return new Response("END Tenant email not found. Please try again.", {
          headers: responseHeaders,
        });
      }
      const data: ChargeApiRequest = {
        // Paystack parses the amount in subunits, so we multiply by 100
        // after parsing it to an integer
        amount: parseInt(prevResponses[3], 10) * 100,
        email: tenantEmail,
        mobile_money: {
          phone: prevResponses[2]!,
          provider: "mpesa",
        },
      };

      const validation = chargeApiRequestSchema.safeParse(data);
      if (!validation.success) {
        console.error("Invalid charge API request", validation.error.format());
        return new Response(
          "END Something went wrong. Please try again later.",
          { headers: responseHeaders },
        );
      }

      console.log(validation.data);

      try {
        const paystackResponse = await fetch("https://api.paystack.co/charge", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${env.PAYSTACK_LIVE_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validation.data),
        });

        if (paystackResponse.status !== 200) {
          console.log(await paystackResponse.json());
          response = "END Transaction failed. Please try again later.";
        } else {
          response = "END You'll receive an M-Pesa prompt shortly.";
        }
      } catch (error) {
        console.error(error);
        response = "END Transaction failed. Please try again later.";
      }
    } else {
      response = "END Transaction cancelled.";
    }
  }

  return new Response(response, {
    headers: responseHeaders,
  });
}
