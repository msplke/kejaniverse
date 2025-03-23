"use server";

import "server-only";

import { auth } from "@clerk/nextjs/server";

import { type CreatePropertyFormData } from "~/app/(dashboard)/properties/new/page";
import { db } from "~/server/db";
import { property } from "~/server/db/schema";

export async function createProperty({
  propertyName,
  bankAccountNo,
}: CreatePropertyFormData) {
  const { userId } = await auth();
  if (!userId) {
    throw new Error("User not authenticated");
  }

  const result = await db
    .insert(property)
    .values({
      ownerId: userId,
      name: propertyName,
      bankAccountNo: bankAccountNo,
    })
    .returning({ insertedId: property.id });

  console.log(result);
  return result[0]?.insertedId;
}
