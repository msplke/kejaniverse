"use client";

import { createContext, type Dispatch, type SetStateAction } from "react";

import { type CreatePropertyPayload } from "~/lib/validators/property";

export const defaultContext: CreatePropertyPayload = {
  propertyName: "",
  bankCode: "",
  bankAccountNumber: "",
  unitTypes: [],
};

export type CreatePropertyFormDispatch = Dispatch<
  SetStateAction<CreatePropertyPayload>
>;

export const CreatePropertyFormContext = createContext(defaultContext);

export const defaultSetValue: CreatePropertyFormDispatch = (v) => {
  console.log(v);
};

export const CreatePropertyFormDispatchContext =
  createContext<CreatePropertyFormDispatch>(defaultSetValue);
