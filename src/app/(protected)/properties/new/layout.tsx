"use client";

import { useState } from "react";
import { UserButton } from "@clerk/nextjs";

import {
  CreatePropertyFormContext,
  CreatePropertyFormDispatchContext,
  defaultContext,
} from "~/components/forms/context";
import { MaxWidthWrapper } from "~/components/max-width-wrapper";
import { ModeToggle } from "~/components/mode-toggle";

export default function Layout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  const [values, setValues] = useState(defaultContext);
  return (
    <CreatePropertyFormContext value={values}>
      <CreatePropertyFormDispatchContext value={setValues}>
        <div className="flex min-h-screen flex-col items-center">
          <MaxWidthWrapper className="flex-1">
            <header className="bg-background sticky top-0 z-50 flex h-14 items-center justify-end space-x-4 px-4 lg:h-[60px]">
              <UserButton />
              <ModeToggle />
            </header>
            <main>{children}</main>
          </MaxWidthWrapper>
        </div>
      </CreatePropertyFormDispatchContext>
    </CreatePropertyFormContext>
  );
}
