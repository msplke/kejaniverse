"use server";

import { auth } from "@clerk/nextjs/server";

import { db } from "../db";
import { property } from "../db/schema";

export async function createProperty(
  propertyName: string,
  bankAccountNo: string,
) {
  const { userId } = await auth();
  if (userId === null) {
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
