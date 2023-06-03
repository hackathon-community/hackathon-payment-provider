import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

interface SettlementEvent extends APIGatewayProxyEventV2 {
  pathParameters: {
    paymentId: string;
  }
}

export const handler = async (event: SettlementEvent): Promise<APIGatewayProxyResultV2> => {

  const { paymentId } = event.pathParameters;

  const settlementResponse = {
    message: 'add here the settlement response object!',
  }

  return {
    body: JSON.stringify(settlementResponse),
    statusCode: 200,
  };
};