import {
  handleAmount,
  handleConfirmation,
  handlePhoneNumber,
  handleUnitName,
  welcome,
} from "./input-handlers";
import { formDataSchema } from "./input-validators";

const responseHeaders = {
  "Content-Type": "application/text",
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

  console.log(validation.data);
  const { text } = validation.data;

  if (text === "") {
    return new Response(welcome(), {
      headers: responseHeaders,
    });
  }

  let responseText;
  const prevResponses = text.split("*");

  if (prevResponses.length === 1) {
    responseText = await handleUnitName(prevResponses[0]!);
  } else if (prevResponses.length === 2) {
    responseText = handleAmount(prevResponses[1]!);
  } else if (prevResponses.length === 3) {
    responseText = handlePhoneNumber(
      prevResponses[2]!,
      prevResponses[0]!,
      prevResponses[1]!,
    );
  } else if (prevResponses.length === 4) {
    responseText = await handleConfirmation(
      prevResponses[3]!,
      prevResponses[0]!,
      prevResponses[1]!,
      prevResponses[2]!,
    );
  }

  return new Response(responseText, {
    headers: responseHeaders,
  });
}
