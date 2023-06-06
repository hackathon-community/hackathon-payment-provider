import axios from "axios";
import {
  AuthorizationRequest,
  CardAuthorization,
  PaymentIntent,
  TransferData,
  isCardAuthorization,
  isTokenizedCard,
} from "../typings";
import { Transfer } from "aws-sdk";

export async function createPaymentMethod({
  requestBody,
}: {
  requestBody: CardAuthorization;
}): Promise<{ id: string } | undefined> {
  const { card } = requestBody;
  let url = null;
  const stripeUrl = "https://api.stripe.com/v1/payment_methods";
  let headers: Record<string, string> = {
    Authorization: `Bearer sk_test_51NFh92GpJfEl5GcVKAAl7MQCWarBxfkW08Mv24d9Qi9rfj9LVrCjiGacbrLDKEr0T8Bk2VZDlyqePETnP2LhR0a700Ezdi6rpb`,
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
      "X-PROVIDER-Forward-Authorization": `Bearer sk_test_51NFh92GpJfEl5GcVKAAl7MQCWarBxfkW08Mv24d9Qi9rfj9LVrCjiGacbrLDKEr0T8Bk2VZDlyqePETnP2LhR0a700Ezdi6rpb`,
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

export async function createPaymentIntent(payload: {
  amount: number;
  currency: string;
  payment_method: string;
  transfer_data?: TransferData[];
  transfer_group?: string;
}): Promise<PaymentIntent> {
  const stripeUrl = "https://api.stripe.com/v1/payment_intents";
  let headers: Record<string, string> = {
    Authorization: `Bearer sk_test_51NFh92GpJfEl5GcVKAAl7MQCWarBxfkW08Mv24d9Qi9rfj9LVrCjiGacbrLDKEr0T8Bk2VZDlyqePETnP2LhR0a700Ezdi6rpb`,
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
