import { redis } from "~/server/redis";

const sessionKey = "ussd-session";
const SESSION_TTL = 60 * 15; // Session request timeout in seconds (15 minutes)

export type USSDSessionData = {
  unitId: string | null;
  amount: string | null;
  phoneNumber: string | null;
};

export async function getUnitId(sessionId: string) {
  const unitId: string | null = await redis.get(
    `${sessionKey}:${sessionId}:unitId`,
  );
  return unitId;
}
export async function setUnitId(sessionId: string, unitId: string) {
  await redis.set(`${sessionKey}:${sessionId}:unitId`, unitId, {
    ex: SESSION_TTL,
  });
}
export async function getAmount(sessionId: string) {
  const amount: string | null = await redis.get(
    `${sessionKey}:${sessionId}:amount`,
  );
  return amount;
}
export async function setAmount(sessionId: string, amount: number) {
  await redis.set(`${sessionKey}:${sessionId}:amount`, amount, {
    ex: SESSION_TTL,
  });
}
export async function getPhoneNumber(sessionId: string) {
  const phoneNumber: string | null = await redis.get(
    `${sessionKey}:${sessionId}:phoneNumber`,
  );
  return phoneNumber;
}
export async function setPhoneNumber(sessionId: string, phoneNumber: string) {
  await redis.set(`${sessionKey}:${sessionId}:phoneNumber`, phoneNumber, {
    ex: SESSION_TTL,
  });
}

export async function getUSSDSessionData(
  sessionId: string,
): Promise<USSDSessionData> {
  const unitId = await getUnitId(sessionId);
  const amount = await getAmount(sessionId);
  const phoneNumber = await getPhoneNumber(sessionId);

  return {
    unitId,
    amount,
    phoneNumber,
  };
}
