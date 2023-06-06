import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import {
  AuthorizationRequest,
  ConPayment,
  TransferData,
  isCardAuthorization,
} from "../typings";
import {
  confirmPaymentIntent,
  createPaymentIntent,
  createPaymentMethod,
} from "../stripeComunication";
import { getAffiliateInfo } from "./affiliatesDynamo";
import { getSecret } from "../secretManager";

const TABLE_NAME = process.env.TABLE_NAME;
const TABLE_AFFLIATES = process.env.TABLE_AFFLIATES;
const ddbResource = new AWS.DynamoDB.DocumentClient();

// PaymentPOST
// Lambda called by API Gateway.
// Responsible for receiving new transactions from VTEX Gateway
export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log("🚀 cheguei aqi");
  const secret = await getSecret();
  const keyStripe = secret["KEY_STRIPE"];
  // Ex 1
  // Example of how to get body from POST
  try {
    if (!event.body) {
      throw new Error("No body found");
    }
    const requestBody = JSON.parse(event.body) as AuthorizationRequest;
    const params = {
      TableName: TABLE_NAME,
      Key: {
        paymentId: { S: requestBody.paymentId },
      },
    };
    const conPaymentData = await ddbResource.getItem(params);

    let conPayment = null;
    if (conPaymentData && conPaymentData.Item) {
      conPayment = conPaymentData.Item as ConPayment;
    }

    if (!conPayment) {
      if (!isCardAuthorization(requestBody)) {
        return {
          body: JSON.stringify({
            status: "undefined",
            message: "payment-method-not-allowed",
          }),
          statusCode: 200,
        };
      }
      const paymentMethod = await createPaymentMethod(
        { requestBody },
        keyStripe
      );
      console.log("🚀 ~ file: handler.ts:30 ~ requestBody:", paymentMethod);
      if (!paymentMethod)
        return {
          body: JSON.stringify({
            status: "undefined",
            message: "not-possible-method-creation",
          }),
          statusCode: 200,
        };

      const suppliers = requestBody.recipients;

      let transfer:
        | {
            transferData: TransferData[];
            transferGroup: string;
          }
        | undefined = undefined;
      if (suppliers) {
        const transferData = [];
        for (let i = 0; i < suppliers.length; i++) {
          const element = suppliers[i];
          const affiliate = await getAffiliateInfo({
            table: TABLE_AFFLIATES as string,
            dbClient: ddbResource,
            id: element.id,
          });

          if (!affiliate) continue;

          transferData.push({
            destination: affiliate.purchaserRecipientId,
            amount: element.amount,
          });
        }
        transfer = {
          transferData: transferData,
          transferGroup: requestBody.orderId,
        };
      }

      const paymentIntent = await createPaymentIntent(
        {
          amount: Math.round(requestBody.value * 100),
          currency: requestBody.currency,
          payment_method: paymentMethod.id,
          transfer_data: transfer?.transferData,
          transfer_group: transfer?.transferGroup,
        },
        keyStripe
      );
      console.log("paymentIntent", paymentIntent);
      const itemDict = {
        paymentId: requestBody.paymentId,
        authorizationId: uuidv4(),
        nsu: uuidv4(),
        tid: paymentIntent.id,
        paymentMethodId: paymentMethod.id,
        paymentMethod: requestBody.paymentMethod,
        status: paymentIntent.status,
      };

      /// Ex 2
      // How to write data in Dynamodb
      await ddbResource
        .put({
          TableName: TABLE_NAME,
          Item: itemDict,
          ReturnValues: "NONE",
          ReturnConsumedCapacity: "TOTAL",
          ConditionExpression: "attribute_not_exists(paymentId)",
        })
        .promise();

      return await handleStatusPayment(itemDict, keyStripe);
    }

    return await handleStatusPayment(conPayment, keyStripe);
  } catch (error) {
    // console.log("🚀 ~ file: handler.ts:135 ~ error:", error);

    return {
      body: JSON.stringify({
        status: "undefined",
        message: "internal-server-error",
      }),
      statusCode: 500,
    };
  }
};

async function handleStatusPayment(itemDict: ConPayment, keyStripe: string) {
  let status = "undefined";
  let message = "waiting";
  let confirmPayment = null;
  switch (itemDict.status) {
    case "canceled":
      status = "denied";
      message = "payment-canceled";
      break;
    case "requires_capture":
      status = "approved";
      message = "waiting-capture";
      break;
    case "succeeded":
      status = "approved";
      message = "payment success";
      break;
    case "requires_confirmation":
      message = "waiting-confirmation";
      confirmPayment = await confirmPaymentIntent(
        itemDict.tid,
        itemDict.paymentMethodId,
        keyStripe
      );
      if (!confirmPayment) {
        status = "undefined";
        message = "payment-intent-error";
      }
      if (confirmPayment?.error) {
        switch (confirmPayment.error?.code) {
          case "card_declined":
            status = "denied";
            message = "card-declined";
            break;
          default:
            break;
        }
      }
      break;
    default:
      confirmPayment = await confirmPaymentIntent(
        itemDict.tid,
        itemDict.paymentMethodId,
        keyStripe
      );
      if (!confirmPayment) {
        status = "undefined";
        message = "payment-intent-error";
      }
      if (confirmPayment?.error) {
        switch (confirmPayment.error?.code) {
          case "card_declined":
            status = "denied";
            message = "card-declined";
            break;
          default:
            status = "denied";
            message = "unknown";
            break;
        }
      }
      break;
  }

  await ddbResource
    .put({
      TableName: TABLE_NAME,
      Item: { ...itemDict, status },
      ReturnValues: "NONE",
      ReturnConsumedCapacity: "TOTAL",
      ConditionExpression: "attribute_not_exists(paymentId)",
    })
    .promise();
  const authorizationResponse = {
    ...itemDict,
    status,
    code: null,
    message,
    delayToAutoSettle: 21600,
    delayToAutoSettleAfterAntifraud: 1800,
    delayToCancel: 21600,
  };

  return {
    body: JSON.stringify(authorizationResponse),
    statusCode: 200,
  };
}
