
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  // const itemDict = {
  //   'paymentId': 'teste',
  //   'status': 'processing'
  // };

  // const dynamoResponse = await ddbResource
  //   .put({
  //     TableName: TABLE_NAME,
  //     Item: itemDict,
  //     ReturnValues: 'NONE',
  //     ReturnConsumedCapacity: 'TOTAL',
  //     ConditionExpression: 'attribute_not_exists(paymentId)'
  //   })
  //   .promise();

  const manifest = {
        "paymentMethods": [],
        "customFields":[]
    }

  return {
    body: JSON.stringify(manifest),
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
  };
};