"use client";

import { useContext, useEffect } from "react";
import { useRouter } from "next/navigation";

import { CreatePropertyFormContext } from "~/components/forms/context";
import {
  CreateUnitTypeForm,
  UnitTypesTable,
} from "~/components/forms/create-unit-type-form";
import { BackButton } from "~/components/ui/back-button";
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
    <div className="p-4">
      <BackButton />
      <h2 className="my-8 text-lg font-semibold">Unit Types</h2>
      <div className="grid gap-8 md:grid-cols-2">
        <UnitTypesTable unitTypes={unitTypes} />
        <Separator className="md:hidden" />
        <CreateUnitTypeForm />
      </div>
    </div>
  );
}
