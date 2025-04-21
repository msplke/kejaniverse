export async function POST(req: Request) {
  console.log("[Paystack Callback]");
  console.log(await req.json());
  console.log("[Paystack Callback]");

  return new Response("OK", { status: 200 });
}
