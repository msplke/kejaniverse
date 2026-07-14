import { CreatePropertyForm } from "~/components/forms/create-property-form";
import ErrorPage from "~/components/pages/error";
import { BackButton } from "~/components/ui/back-button";
import { api } from "~/trpc/server";

export const dynamic = "force-dynamic";

export default async function NewPropertyPage() {
  let banks;
  try {
    banks = await api.paystack.fetchBanks();
  } catch (error) {
    console.error("Error fetching banks:", error);
  }

  if (!banks) {
    return <ErrorPage />;
  }

  return (
    <div className="p-4 md:p-0">
      <BackButton />
      <h1 className="my-8 text-xl">Create Property</h1>
      <CreatePropertyForm banks={banks} />
    </div>
  );
}
