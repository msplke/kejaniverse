import Image from "next/image";

import { Icons } from "~/components/icons";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";

export function ForTenants() {
  return (
    <section
      id="tenants"
      className="bg-background w-full py-12 md:py-24 lg:py-32"
    >
      <MaxWidthWrapper>
        <div className="grid items-center gap-6 lg:grid-cols-2 lg:gap-12">
          <div className="order-last flex items-center justify-center lg:order-first">
            <div className="bg-background relative h-[500px] w-full overflow-hidden rounded-lg border shadow-xl">
              <Image
                src="/placeholder.svg?height=1000&width=800"
                alt="Tenant Payment Interface"
                fill
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex flex-col justify-center space-y-4">
            <div className="bg-primary/10 text-primary inline-block w-fit rounded-xl px-3 py-1 text-sm">
              For Tenants
            </div>
            <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl md:text-5xl">
              Hassle-free rent payments
            </h2>
            <p className="text-muted-foreground md:text-xl">
              Pay your rent securely through multiple payment options and keep
              track of your payment history.
            </p>
            <ul className="grid gap-3">
              {[
                "Pay rent via mobile money (USSD/Mpesa) or cards",
                "Get timely payment reminders",
                "Receive automatic payment receipts",
                "Stay informed about your rental status",
                "Access outstanding support",
              ].map((item, i) => (
                <li key={i} className="flex items-center gap-2">
                  <Icons.checkCircle className="text-primary h-5 w-5 flex-shrink-0" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </MaxWidthWrapper>
    </section>
  );
}
