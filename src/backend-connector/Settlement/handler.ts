import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import AWS from "aws-sdk";
const ddbResource = new AWS.DynamoDB.DocumentClient();
import { v4 as uuidv4 } from "uuid";
import { capturePaymentIntent } from "../stripeComunication";
import { getSecret } from "../secretManager";
import { ConPayment, SettlementResponse } from "../typings";

interface SettlementEvent extends APIGatewayProxyEventV2 {
  pathParameters: {
    paymentId: string;
    requestId: string;
  };
}

const TABLE_NAME = process.env.TABLE_NAME;
export const handler = async (
  event: SettlementEvent
): Promise<APIGatewayProxyResultV2> => {
  const secret = await getSecret();
  const keyStripe = secret["KEY_STRIPE"];
  const { paymentId, requestId } = event.pathParameters;
  const params = {
    TableName: TABLE_NAME,
    Key: {
      paymentId: { S: paymentId },
    },
  };
  const conPaymentData = await ddbResource.getItem(params);
  const settlementResponse: SettlementResponse = {
    paymentId: paymentId,
    settleId: null,
    value: 0,
    code: "",
    message: "",
    requestId: requestId,
  };
  if (!conPaymentData || !conPaymentData.Item) {
    settlementResponse.message = "Payment not created";
  } else {
    const conPaymentItem = conPaymentData.Item as ConPayment;
    let status = "canceled";
    const settleData = await capturePaymentIntent(
      conPaymentItem.tid,
      keyStripe
    );

    switch (true) {
      case Boolean(!settleData):
        settlementResponse.message = "internal-server-error";
        break;
      case Boolean(settleData.error):
        settlementResponse.message = "internal-server-error";
        break;
      case settleData.status === "succeeded":
        status = "succeeded";
        settlementResponse.message = "success";
        settlementResponse.settleId = uuidv4();
        break;
      default:
        settlementResponse.message = "internal-server-error";
        break;
    }
    await ddbResource
      .put({
        TableName: TABLE_NAME,
        Item: {
          ...conPaymentItem,
          status,
          settleId: settlementResponse.settleId,
        },
        ReturnValues: "NONE",
        ReturnConsumedCapacity: "TOTAL",
        ConditionExpression: "attribute_not_exists(paymentId)",
      })
      .promise();
  }

  return {
    body: JSON.stringify(settlementResponse),
    statusCode: 200,
  };
};
