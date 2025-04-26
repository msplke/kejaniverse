export interface Bank {
  id: number;
  code: string;
  name: string;
  slug: string;
  country: string;
  currency: string;
  active: boolean;
  is_deleted: boolean;
}

export interface FetchBanksResponse {
  status: boolean;
  message: string;
  data: Bank[];
}

export type CreateSubaccountPayload = {
  business_name: string;
  bank_code: string;
  account_number: string;
  percentage_charge: number;
  description?: string;
  primary_contact_name?: string;
  primary_contact_email?: string;
  primary_contact_phone?: string;
};

export interface Subaccount {
  id: number;
  subaccount_code: string;
  business_name: string;
  description: string | null;
  primary_contact_name: string | null;
  primary_contact_email: string | null;
  primary_contact_phone: string | null;
  percentage_charge: number;
  settlement_bank: string;
  account_number: string;
  currency: string;
  active: boolean;
  is_verified: boolean;
  settlement_schedule: string;
}

export interface CreateSubaccountResponse {
  status: boolean;
  message: string;
  data: Subaccount;
}
