
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {

  const manifest = {
        "paymentMethods": [],
        "customFields":[]
    }

  return {
    body: JSON.stringify(manifest),
    statusCode: 200
  };
};