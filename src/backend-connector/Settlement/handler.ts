import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {

  console.log('event', event);

  const settlementResponse = {
    message: 'add here the settlement response object!',
  }

  return {
    body: JSON.stringify(settlementResponse),
    statusCode: 200,
  };
};