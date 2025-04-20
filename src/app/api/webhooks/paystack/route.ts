import { createHmac } from "crypto";

import { env } from "~/env";

const secret = env.PAYSTACK_LIVE_SECRET_KEY;

export async function POST(req: Request) {
  const hash = createHmac("sha512", secret)
    .update(await req.text())
    .digest("hex");

  if (hash !== req.headers.get("x-paystack-signature")) {
    return new Response("Invalid signature", { status: 401 });
  }

  const body = await req.json();
  console.log("Body:");
  console.log(body);
  const event = body.event;

  console.log(event);

  return new Response("OK", { status: 200 });
}
