import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import AWS from "aws-sdk";
const ddbResource = new AWS.DynamoDB.DocumentClient();
import { v4 as uuidv4 } from "uuid";
import { capturePaymentIntent } from "../stripeComunication";
import { getSecret } from "../secretManager";
import { ConPayment, RefundResponse } from "../typings";

const TABLE_NAME = process.env.TABLE_NAME;

interface RefundEvent extends APIGatewayProxyEventV2 {
  pathParameters: {
    paymentId: string;
    requestId: string;
  };
}

export const handler = async (
  event: RefundEvent
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
  const refundReponse: RefundResponse = {
    paymentId: paymentId,
    refundId: null,
    code: "",
    message: "",
    requestId: requestId,
  };
  if (!conPaymentData || !conPaymentData.Item) {
    refundReponse.message = "Payment not created";
  } else {
    const conPaymentItem = conPaymentData.Item as ConPayment;
    let status = "canceled";
    const settleData = await capturePaymentIntent(
      conPaymentItem.tid,
      keyStripe
    );

    switch (true) {
      case Boolean(!settleData):
        refundReponse.message = "internal-server-error";
        break;
      case Boolean(settleData.error):
        refundReponse.message = "internal-server-error";
        break;
      case settleData.status === "canceled":
        status = "canceled";
        refundReponse.message = "canceled";
        refundReponse.refundId = uuidv4();
        break;
      default:
        refundReponse.message = "internal-server-error";
        break;
    }
    await ddbResource
      .put({
        TableName: TABLE_NAME,
        Item: {
          ...conPaymentItem,
          status,
          refundId: refundReponse.refundId,
        },
        ReturnValues: "NONE",
        ReturnConsumedCapacity: "TOTAL",
        ConditionExpression: "attribute_not_exists(paymentId)",
      })
      .promise();
  }

  return {
    body: JSON.stringify(refundReponse),
    statusCode: 200,
  };
};
