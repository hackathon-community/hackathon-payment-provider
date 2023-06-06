import axios from "axios";
import {
  CardAuthorization,
  PaymentIntent,
  TransferData,
  isTokenizedCard,
} from "./typings";

export async function createPaymentMethod(
  {
    requestBody,
  }: {
    requestBody: CardAuthorization;
  },
  keyStripe: string
): Promise<{ id: string } | undefined> {
  const { card } = requestBody;
  let url = null;
  const stripeUrl = "https://api.stripe.com/v1/payment_methods";
  let headers: Record<string, string> = {
    Authorization: `Bearer ${keyStripe}`,
  };
  let body = {
    type: "card",
    card: {
      number: "",
      exp_month: card["expiration"]["month"],
      exp_year: card["expiration"]["year"],
      cvc: "",
    },
  };
  if (!isTokenizedCard(card)) {
    url = stripeUrl;
    body["card"]["number"] = card["number"];
    body["card"]["cvc"] = card["csc"];
  } else {
    url = requestBody.secureProxyUrl;
    body["card"]["number"] = card["numberToken"];
    body["card"]["cvc"] = card["cscToken"];
    headers = {
      "X-PROVIDER-Forward-To": stripeUrl,
      "X-PROVIDER-Forward-Authorization": `Bearer ${keyStripe}`,
    };
  }
  return await axios
    .post(url as string, body, {
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((r) => r.data)
    .catch((e) => console.log("🚀", e.response.data));
}

export async function createPaymentIntent(
  payload: {
    amount: number;
    currency: string;
    payment_method: string;
    transfer_data?: TransferData[];
    transfer_group?: string;
  },
  keyStripe: string
): Promise<PaymentIntent> {
  const stripeUrl = "https://api.stripe.com/v1/payment_intents";
  let headers: Record<string, string> = {
    Authorization: `Bearer ${keyStripe}`,
  };
  return await axios
    .post(stripeUrl, payload, {
      headers: {
        ...headers,
        "Content-Type": "application/x-www-form-urlencoded",
      },
    })
    .then((r) => r.data)
    .catch((e) => console.log("🚀", e.response.data));
}

export async function confirmPaymentIntent(
  id: string,
  paymentMethodId: string,
  keyStripe: string
): Promise<PaymentIntent> {
  const stripeUrl = `https://api.stripe.com/v1/payment_intents/${id}/confirm`;
  let headers: Record<string, string> = {
    Authorization: `Bearer ${keyStripe}`,
  };
  return await axios
    .post(
      stripeUrl,
      { payment_method: paymentMethodId },
      {
        headers: {
          ...headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((r) => r.data)
    .catch((e) => e?.response?.data ?? undefined);
}

export async function capturePaymentIntent(
  id: string,
  keyStripe: string
): Promise<PaymentIntent> {
  const stripeUrl = `https://api.stripe.com/v1/payment_intents/${id}/capture`;
  let headers: Record<string, string> = {
    Authorization: `Bearer ${keyStripe}`,
  };
  return await axios
    .post(
      stripeUrl,
      {},
      {
        headers: {
          ...headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((r) => r.data)
    .catch((e) => e?.response?.data ?? undefined);
}

export async function cancelPaymentIntent(
  id: string,
  keyStripe: string
): Promise<PaymentIntent> {
  const stripeUrl = `https://api.stripe.com/v1/payment_intents/${id}/cancel`;
  let headers: Record<string, string> = {
    Authorization: `Bearer ${keyStripe}`,
  };
  return await axios
    .post(
      stripeUrl,
      {},
      {
        headers: {
          ...headers,
          "Content-Type": "application/x-www-form-urlencoded",
        },
      }
    )
    .then((r) => r.data)
    .catch((e) => e?.response?.data ?? undefined);
}
