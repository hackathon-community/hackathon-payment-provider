import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import AWS from "aws-sdk";
const ddbResource = new AWS.DynamoDB.DocumentClient();
import { v4 as uuidv4 } from "uuid";
import { capturePaymentIntent } from "../stripeComunication";
import { getSecret } from "../secretManager";
import { CancellationResponse, ConPayment } from "../typings";

interface CancellationEvent extends APIGatewayProxyEventV2 {
  pathParameters: {
    paymentId: string;
    requestId: string;
  };
}

const TABLE_NAME = process.env.TABLE_NAME;
export const handler = async (
  event: CancellationEvent
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
  const cancellationResponse: CancellationResponse = {
    paymentId: paymentId,
    cancellationId: null,
    code: "",
    message: "",
    requestId: requestId,
  };
  if (!conPaymentData || !conPaymentData.Item) {
    cancellationResponse.message = "Payment not created";
  } else {
    const conPaymentItem = conPaymentData.Item as ConPayment;
    let status = "canceled";
    const settleData = await capturePaymentIntent(
      conPaymentItem.tid,
      keyStripe
    );

    switch (true) {
      case Boolean(!settleData):
        cancellationResponse.message = "internal-server-error";
        break;
      case Boolean(settleData.error):
        cancellationResponse.message = "internal-server-error";
        break;
      case settleData.status === "canceled":
        status = "canceled";
        cancellationResponse.message = "canceled";
        cancellationResponse.cancellationId = uuidv4();
        break;
      default:
        cancellationResponse.message = "internal-server-error";
        break;
    }
    await ddbResource
      .put({
        TableName: TABLE_NAME,
        Item: {
          ...conPaymentItem,
          status,
          cancellationId: cancellationResponse.cancellationId,
        },
        ReturnValues: "NONE",
        ReturnConsumedCapacity: "TOTAL",
        ConditionExpression: "attribute_not_exists(paymentId)",
      })
      .promise();
  }

  return {
    body: JSON.stringify(cancellationResponse),
    statusCode: 200,
  };
};
