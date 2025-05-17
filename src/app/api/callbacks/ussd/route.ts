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

const responseHeaders = {
  "Content-Type": "text/plain",
};

/**
 * Handles the USSD callback from the Afirca's Talking API.
 * It validates the input data and processes the USSD flow.
 * Currently, due to the simple array-based approach,
 * retries for invalid inputs or skips to arbitrary steps are not supported.
 * The session is ended if the input is invalid.
 */
export async function POST(req: Request) {
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

  const { text, sessionId } = validation.data;

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
