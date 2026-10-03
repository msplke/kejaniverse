import { timingSafeEqual } from "node:crypto";

import {
  handleAmount,
  handleConfirmation,
  handlePhoneNumber,
  handleUnitId,
  welcome,
} from "~/app/api/callbacks/ussd/input-handlers";
import { formDataSchema } from "~/app/api/callbacks/ussd/input-validators";
import {
  getUSSDSessionData,
  type USSDSessionData,
} from "~/app/api/callbacks/ussd/ussd-session-handler";
import { env } from "~/env";
import { redis } from "~/server/redis";

const responseHeaders = {
  "Content-Type": "text/plain",
};

const RATE_LIMIT_MAX_REQUESTS = 10;
const RATE_LIMIT_WINDOW_SECONDS = 60;

/**
 * Constant-time comparison of the `token` query parameter against the
 * shared secret configured in the Africa's Talking dashboard callback URL.
 */
function isValidCallbackToken(token: string | null): boolean {
  if (!token) {
    return false;
  }
  const expected = Buffer.from(env.USSD_CALLBACK_TOKEN);
  const received = Buffer.from(token);
  if (received.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(received, expected);
}

/**
 * Handles the USSD callback from the Afirca's Talking API.
 * It validates the input data and processes the USSD flow.
 * Currently, due to the simple array-based approach,
 * retries for invalid inputs or skips to arbitrary steps are not supported.
 * The session is ended if the input is invalid.
 */
export async function POST(req: Request) {
  // Authenticate the Africa's Talking origin before any parsing or dispatch.
  const token = new URL(req.url).searchParams.get("token");
  if (!isValidCallbackToken(token)) {
    return new Response("Unauthorized", { status: 401 });
  }

  const validation = formDataSchema.safeParse(await req.formData());
  if (!validation.success) {
    console.error(
      "Invalid AT form-encoded parameters",
      validation.error.format(),
    );
    return new Response("END Something went wrong. Please try again later.", {
      status: 200,
    });
  }

  const { text, sessionId, phoneNumber: callerPhoneNumber } = validation.data;

  // Fixed-window rate limit per phone number.
  try {
    const rateLimitKey = `ussd-ratelimit:${callerPhoneNumber}`;
    const requestCount = await redis.incr(rateLimitKey);
    if (requestCount === 1) {
      // Start the window when the counter is first created
      await redis.expire(rateLimitKey, RATE_LIMIT_WINDOW_SECONDS);
    }
    if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
      return new Response("END Too many requests. Try again later.", {
        status: 200,
        headers: responseHeaders,
      });
    }
  } catch (error) {
    console.error("Error applying USSD rate limit:", error);
    return new Response("END Something went wrong. Please try again later.", {
      status: 200,
    });
  }

  if (text === "") {
    return new Response(welcome(), {
      headers: responseHeaders,
    });
  }

  // The response to be sent back to the AT server
  let endpointResponseText: string;

  // `text` represents the previous responses,
  //  and is a string of the form "1*2*3*4*5"
  const prevResponses = text.split("*");
  // Since the session data is now stored using Redis,
  // we can use the last response to determine the next step.
  const lastResponse: string = prevResponses[prevResponses.length - 1]!;
  console.log("Last response:", lastResponse);
  console.log("Prev responses:", prevResponses);

  let sessionData: USSDSessionData;
  try {
    sessionData = await getUSSDSessionData(sessionId);
  } catch (error) {
    console.error("Error retrieving session data:", error);
    return new Response("END Something went wrong. Please try again later.", {
      status: 200,
    });
  }
  console.log("Session:", sessionId);
  console.log("Session data:", sessionData);

  const { unitId, amount, phoneNumber } = sessionData;

  if (!unitId) {
    const userUnitId = lastResponse;
    endpointResponseText = await handleUnitId(sessionId, userUnitId);
  } else if (!amount) {
    const userAmount = lastResponse;
    endpointResponseText = await handleAmount(sessionId, userAmount);
  } else if (!phoneNumber) {
    const userPhoneNumber = lastResponse;
    endpointResponseText = await handlePhoneNumber(
      sessionId,
      userPhoneNumber,
      unitId,
      amount,
    );
  } else {
    const choice = lastResponse;
    endpointResponseText = await handleConfirmation(
      choice,
      unitId,
      amount,
      phoneNumber,
    );
  }
  return new Response(endpointResponseText, {
    headers: responseHeaders,
  });
}
