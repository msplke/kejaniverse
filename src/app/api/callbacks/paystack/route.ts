export async function POST(req: Request) {
  const body = await req.json();
  console.log("Body:");
  console.log(body);
  const event = body.event;

  console.log("[Paystack Callback]");
  console.log(event);
  console.log("[Paystack Callback]");

  return new Response("OK", { status: 200 });
}
