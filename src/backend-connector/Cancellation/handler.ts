import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {

  const cancellationResponse = {
    message: 'add here the cancellation response object!',
  }

  return {
    body: JSON.stringify(cancellationResponse),
    statusCode: 200,
  };
};