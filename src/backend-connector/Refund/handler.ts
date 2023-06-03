import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

interface RefundEvent extends APIGatewayProxyEventV2 {
  pathParameters: {
    paymentId: string;
  }
}

export const handler = async (event: RefundEvent): Promise<APIGatewayProxyResultV2> => {

  const { paymentId } = event.pathParameters;

  const refundResponse = {
    message: 'add here the refund response object!',
  }

  return {
    body: JSON.stringify(refundResponse),
    statusCode: 200,
  };
};