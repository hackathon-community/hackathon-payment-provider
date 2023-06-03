import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

interface CancellationEvent extends APIGatewayProxyEventV2 {
  pathParameters: {
    paymentId: string;
  }
}

export const handler = async (event: CancellationEvent): Promise<APIGatewayProxyResultV2> => {

  const { paymentId } = event.pathParameters;

  const cancellationResponse = {
    message: 'add here the cancellation response object!',
  }

  return {
    body: JSON.stringify(cancellationResponse),
    statusCode: 200,
  };
};