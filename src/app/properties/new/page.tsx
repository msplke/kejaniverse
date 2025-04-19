import { CreatePropertyForm } from "~/components/forms/create-property-form";
import { fetchBanks } from "~/server/actions";

export default async function CreatePropertyPage() {
  const banks = await fetchBanks();

  return (
    <div>
      <div className="max-w-xs">
        <CreatePropertyForm banks={banks} />
      </div>
    </div>
  );
}
