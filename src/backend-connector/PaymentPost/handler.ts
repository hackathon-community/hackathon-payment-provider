
import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import AWS from 'aws-sdk';
import axios from 'axios';

const TABLE_NAME = process.env.TABLE_NAME;
const ddbResource = new AWS.DynamoDB.DocumentClient();

export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {
  
  // Ex 1
  // Example of how to get body from POST
  const requestBody = JSON.parse(event.body || '');

  const itemDict = {
    'paymentId': requestBody['paymentId'],
    'paymentMethod': requestBody['paymentMethod'],
    'currency': requestBody['currency'],
    'returnUrl': requestBody['returnUrl'],
    'colunaNova': requestBody['colunaNova'],
    'status': 'processing'
  };

  /// Ex 2
  // How to write data in Dynamodb
  const dynamoResponse = await ddbResource
    .put({
      TableName: TABLE_NAME,
      Item: itemDict,
      ReturnValues: 'NONE',
      ReturnConsumedCapacity: 'TOTAL',
      ConditionExpression: 'attribute_not_exists(paymentId)'
      })
    .promise();

  const json = {
        "result": "worked"
    }

  return {
    body: JSON.stringify(json),
    statusCode: 200,
    headers: {
      'Access-Control-Allow-Headers': 'Content-Type',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'OPTIONS,POST,GET'
    },
  };
};