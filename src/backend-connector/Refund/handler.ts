import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {

  const refundResponse = {
    message: 'add here the refund response object!',
  }

  return {
    body: JSON.stringify(refundResponse),
    statusCode: 200,
  };
};