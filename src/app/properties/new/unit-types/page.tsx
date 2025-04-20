"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

import { CreatePropertyFormContext } from "~/components/forms/context";
import {
  CreateUnitTypeForm,
  UnitTypesTable,
} from "~/components/forms/create-unit-type-form";
import { Separator } from "~/components/ui/separator";

export default function Page() {
  const router = useRouter();

  const { bankCode, bankAccountNumber, propertyName, unitTypes } = useContext(
    CreatePropertyFormContext,
  );

  useEffect(() => {
    if (!bankCode || !bankAccountNumber || !propertyName) {
      router.push("/properties/new");
    }
  }, [router, bankCode, bankAccountNumber, propertyName]);

  return (
    <div>
      <div className="grid gap-8 md:grid-cols-2">
        <UnitTypesTable unitTypes={unitTypes} />
        <Separator className="md:hidden" />
        <CreateUnitTypeForm />
      </div>
    </div>
  );
}
