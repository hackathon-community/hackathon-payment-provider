import { DynamoDBStreamEvent, DynamoDBStreamHandler } from 'aws-lambda';
import AWS from 'aws-sdk';

const sqs = new AWS.SQS();

// Pending Payment Stream
// Lambda triggered by DynamoDB stream (INSERT and MODIFY). 
// Responsible for retrieving new records from DynamoDB streams and writing on SQS
export const handler: DynamoDBStreamHandler = async (event: DynamoDBStreamEvent) => {
  console.log(event);

  // Ex 1 
  // Read DynamoDB stream events
  for (const record of event.Records) {
    // Get the DynamoDB stream record
    const dynamodbRecord = record.dynamodb;
    // Get the new image
    if (!dynamodbRecord) {
      continue;
    }
    const newImage = dynamodbRecord.NewImage;

    const itemDict = {
      'paymentId': newImage?.paymentId.S || '',
      'paymentMethod': newImage?.paymentMethod.S || '',
      'currency': newImage?.currency.S || '',
      'returnUrl': newImage?.returnUrl.S || '',
      'status': newImage?.status.S || ''
    };

    // Ex 2
    // How to get Queue and Write item to SQS queue
    const queueUrl = await sqs.getQueueUrl({ QueueName: process.env.PENDING_PAYMENT_QUEUE || '' }).promise();
    const response = await sqs
      .sendMessage({
        QueueUrl: queueUrl.QueueUrl,
        MessageBody: JSON.stringify(itemDict)
      })
      .promise();

    console.log(response);
    console.log('Message sent to SQS queue');
  }
};
