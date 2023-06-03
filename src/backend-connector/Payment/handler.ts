import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {

  const authorizationResponse = {
    message: 'add here the authorization response object!',
  }

  return {
    body: JSON.stringify(authorizationResponse),
    statusCode: 200,
  };
};