import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import AWS from "aws-sdk";
import { v4 as uuidv4 } from "uuid";
import {
  AuthorizationRequest,
  TransferData,
  isCardAuthorization,
} from "../typings";
import { createPaymentIntent, createPaymentMethod } from "./stripeComunication";
import { getAffiliateInfo } from "./affiliatesDynamo";

const TABLE_NAME = process.env.TABLE_NAME;
const TABLE_AFFLIATES = process.env.TABLE_AFFLIATES;
const ddbResource = new AWS.DynamoDB.DocumentClient();

// PaymentPOST
// Lambda called by API Gateway.
// Responsible for receiving new transactions from VTEX Gateway
export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  // Ex 1
  // Example of how to get body from POST
  try {
    if (!event.body) {
      throw new Error("No body found");
    }
    const requestBody = JSON.parse(event.body) as AuthorizationRequest;
    if (!isCardAuthorization(requestBody)) {
      return {
        body: JSON.stringify({ message: "payment method invalid." }),
        statusCode: 500,
      };
    }
    const paymentMethod = await createPaymentMethod({ requestBody });
    console.log("🚀 ~ file: handler.ts:30 ~ requestBody:", paymentMethod);
    if (!paymentMethod)
      return {
        body: JSON.stringify({
          message: "not possible to create payment method.",
        }),
        statusCode: 500,
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

    const paymentIntent = await createPaymentIntent({
      amount: requestBody.value,
      currency: requestBody.currency,
      payment_method: paymentMethod.id,
      transfer_data: transfer?.transferData,
      transfer_group: transfer?.transferGroup,
    });
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

    const authorizationResponse = {
      ...itemDict,
      code: null,
      message: null,
      delayToAutoSettle: 21600,
      delayToAutoSettleAfterAntifraud: 1800,
      delayToCancel: 21600,
    };

    return {
      body: JSON.stringify(authorizationResponse),
      statusCode: 200,
    };
  } catch (error) {
    console.log("🚀 ~ file: handler.ts:135 ~ error:", error);

    return {
      body: JSON.stringify({
        message: "not possible to create payment method.",
      }),
      statusCode: 500,
    };
  }
};
