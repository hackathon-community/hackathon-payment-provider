import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from 'aws-lambda';
import AWS from 'aws-sdk';
import axios from 'axios';
import { AuthorizationRequest, PaymentResponse } from '../typings';

const TABLE_NAME = process.env.TABLE_NAME;
const ddbResource = new AWS.DynamoDB.DocumentClient();

// PaymentPOST
// Lambda called by API Gateway.
// Responsible for receiving new transactions from VTEX Gateway
export const handler = async (event: APIGatewayProxyEventV2): Promise<APIGatewayProxyResultV2> => {

   // Ex 1
  // Example of how to get body from POST
  if(event.body) {
    console.log(event.body);
  } else {
    throw new Error('No body found');
  }

  const requestBody = JSON.parse(event.body) as AuthorizationRequest;

  const itemDict = {
    'paymentId': requestBody['paymentId'],
    'paymentMethod': requestBody['paymentMethod'],
    'currency': requestBody['currency'],
    'returnUrl': requestBody['returnUrl'],
    'status': 'undefined'
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

  const authorizationResponse = {
    message: 'add here the authorization response object!',
  }

  return {
    body: JSON.stringify(authorizationResponse),
    statusCode: 200,
  };
};