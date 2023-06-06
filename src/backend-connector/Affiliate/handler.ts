import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import AWS from "aws-sdk";
import axios from "axios";

const TABLE_AFFLIATES = process.env.TABLE_AFFLIATES;
const STRIPE_AFFLIATES = process.env.STRIPE_AFFLIATES;
const VTEXTOKEN_AFFLIATES = process.env.VTEXTOKEN_AFFLIATES;
const VTEXKEY_AFFLIATES = process.env.VTEXKEY_AFFLIATES;
const ddbResource = new AWS.DynamoDB.DocumentClient();

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (!event.body) {
    throw new Error("No body found");
  }
  const requestBody = JSON.parse(event.body) as {
    fullName: string;
    storeName: string;
    email: string;
    documentType: "cpf" | "cnpj";
    document: string;
    phone: string;
    urlIdentifier: string;
    cep: string;
    number: string;
    street: string;
    neighborhood: string;
    complement: string;
    city: string;
    state: string;
    country: string;
    facebook?: string;
    instagram?: string;
    whatsapp?: string;
    gtmId?: string;
  }; // criar interface para o payload que deve ser enviado

  const documentAffiliate = requestBody["document"].replace(/\D/g, "");
  const [firstName, lastName] = requestBody["fullName"].split(" ");
  const dateInputAffiliate = Date.now();

  const payloadStripe = {
    document: documentAffiliate,
    email: requestBody.email,
    country: "BR",
    type: "custom",
    business_type: "individual",
    individual: {
      address: {
        city: requestBody["city"],
        country: "BR",
        line1: "address_full_match",
        postal_code: requestBody["cep"],
        state: requestBody["state"],
      },
      dob: {
        day: "1",
        month: "1",
        year: "1901",
      },
      email: requestBody["email"],
      first_name: firstName,
      last_name: lastName,
      phone: "+0000000000",
      political_exposure: "none",
    },
    charges_enabled: true,
    capabilities: {
      card_payments: { requested: true },
      transfers: { requested: true },
    },
    payouts_enabled: true,
    tos_acceptance: {
      date: dateInputAffiliate,
      ip: "0.0.0.0",
    },
  };
  const authStripe = {
    headers: {
      Authorization: STRIPE_AFFLIATES,
    },
  };
  /* Make stripe request */
  // await axios.post()
  const stripeResponse = await axios.post(
    "https://api.stripe.com/v1/accounts",
    payloadStripe,
    authStripe
  );
  const stripeId = stripeResponse.data.id;

  // Depois de Criar Affiliado na Stripe Execute isto
  const payloadVtex = {
    document: documentAffiliate,
    email: requestBody.email,
    slug: requestBody["urlIdentifier"],
    name: requestBody["fullName"],
    storeName: requestBody["storeName"],
    phone: requestBody["phone"],
    address: {
      city: requestBody["city"],
      complement: requestBody["complement"],
      country: requestBody["country"],
      neighborhood: requestBody["neighborhood"],
      number: requestBody["number"],
      postalCode: requestBody["cep"],
      reference: requestBody["complement"],
      state: requestBody["state"],
      street: requestBody["street"],
    },
    marketing: {
      instagram: requestBody["instagram"],
      whatsapp: requestBody["whatsapp"],
      facebook: requestBody["facebook"],
      gtmId: requestBody["gtmId"],
    },
  };
  const authVtex = {
    headers: {
      "X-VTEX-API-AppKey": VTEXKEY_AFFLIATES,
      "X-VTEX-API-AppToken": VTEXTOKEN_AFFLIATES,
    },
  };

  /* Make VTEX request */
  const vtexResponse = await axios.post(
    "https://vtexdayhackathon2.vtexcommercestable.com.br/_v/affiliate",
    payloadVtex,
    authVtex
  );
  const vtexId = vtexResponse.data.id;

  // Depois de criar afiliado na vtex execute isso
  const itemsDict = {
    id: vtexId,
    document: documentAffiliate,
    purchaserRecipientId: stripeId,
  };
  try {
    await ddbResource
      .put({
        TableName: TABLE_AFFLIATES,
        Item: itemsDict,
        ReturnValues: "NONE",
        ReturnConsumedCapacity: "TOTAL",
        ConditionExpression:
          "attribute_not_exists(document) or attribute_not_exists(id)",
      })
      .promise();

    return {
      body: "Affiliado criado com sucesso.",
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
    };
  } catch (err) {
    return {
      body: "Ocorreu um erro com a sua requisição.",
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
    };
  }
};
