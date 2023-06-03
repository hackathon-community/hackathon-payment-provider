import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

/* User
Lambda called by API Gateway.
Responsible for registering new users in VTEX and acquirers
 */
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {

  return {
    body: JSON.stringify('Hello from Lambda!'),
    statusCode: 200,
    // THIS HEADER PART is mandatory for CORS to work
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST'
    },
  };
};