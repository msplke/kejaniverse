"use client";

import type React from "react";
import { useState } from "react";

import { defaultContext, FormContext, SetFormValuesContext } from "./context";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [values, setValues] = useState(defaultContext);
  return (
    <FormContext value={values}>
      <SetFormValuesContext value={setValues}>
        <div>
          <h1 className="mb-8 text-xl">Create Property</h1>
          {children}
        </div>
      </SetFormValuesContext>
    </FormContext>
  );
}
