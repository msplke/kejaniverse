"use client";

import { useState } from "react";

import {
  CreatePropertyFormContext,
  CreatePropertyFormDispatchContext,
  defaultContext,
} from "~/components/forms/context";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [values, setValues] = useState(defaultContext);
  return (
    <CreatePropertyFormContext value={values}>
      <CreatePropertyFormDispatchContext value={setValues}>
        <div>
          <h1 className="mb-8 text-xl">Create Property</h1>
          {children}
        </div>
      </CreatePropertyFormDispatchContext>
    </CreatePropertyFormContext>
  );
}
