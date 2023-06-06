import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  const manifest = {
    paymentMethods: [
      {
        name: "Visa",
        allowsSplit: "onCapture",
      },
      {
        name: "American Express",
        allowsSplit: "onCapture",
      },
      {
        name: "Diners",
        allowsSplit: "onCapture",
      },
      {
        name: "Elo",
        allowsSplit: "onCapture",
      },
      {
        name: "Hipercard",
        allowsSplit: "onCapture",
      },
      {
        name: "Mastercard",
        allowsSplit: "onCapture",
      },
    ],
    customFields: [],
  };

  return {
    body: JSON.stringify(manifest),
    statusCode: 200,
    headers: {
      "Access-Control-Allow-Headers": "Content-Type",
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
    },
  };
};
