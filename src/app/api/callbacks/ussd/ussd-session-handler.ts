import { redis } from "~/server/redis";

const sessionKey = "ussd-session";

export type USSDSessionData = {
  unitId: string | null;
  amount: string | null;
  phoneNumber: string | null;
};

export class USSDSessionDataHandler {
  static async getUnitId(sessionId: string): Promise<string | null> {
    const unitId: string | null = await redis.get(
      `${sessionKey}:${sessionId}:unitId`,
    );
    return unitId;
  }
  static async setUnitId(sessionId: string, unitId: string): Promise<void> {
    await redis.set(`${sessionKey}:${sessionId}:unitId`, unitId);
  }
  static async getAmount(sessionId: string): Promise<string | null> {
    const amount: string | null = await redis.get(
      `${sessionKey}:${sessionId}:amount`,
    );
    return amount;
  }
  static async setAmount(sessionId: string, amount: number): Promise<void> {
    await redis.set(`${sessionKey}:${sessionId}:amount`, amount);
  }
  static async getPhoneNumber(sessionId: string): Promise<string | null> {
    const phoneNumber: string | null = await redis.get(
      `${sessionKey}:${sessionId}:phoneNumber`,
    );
    return phoneNumber;
  }
  static async setPhoneNumber(
    sessionId: string,
    phoneNumber: string,
  ): Promise<void> {
    await redis.set(`${sessionKey}:${sessionId}:phoneNumber`, phoneNumber);
  }

  static async sessionData(sessionId: string): Promise<USSDSessionData> {
    const unitId = await this.getUnitId(sessionId);
    const amount = await this.getAmount(sessionId);
    const phoneNumber = await this.getPhoneNumber(sessionId);

    return {
      unitId,
      amount,
      phoneNumber,
    };
  }
}
