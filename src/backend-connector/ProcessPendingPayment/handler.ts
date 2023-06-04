import { SQSEvent, SQSHandler } from 'aws-lambda';
import { SQS } from 'aws-sdk';
import * as AWS from 'aws-sdk';

const sqs = new AWS.SQS();

// Process Pending Payment
// Lambda triggered by new item in SQS. 
// Responsible for processing pending payment with adquirencies.
export const handler: SQSHandler = async (event: SQSEvent) => {

  // Ex 1
  // Read SQS message from event
  const body = JSON.parse(event.Records[0].body);

  // Ex 2
  // Delete Message from Queue
  //const sqs = new AWS.SQS();
  //const deleteParams: SQS.DeleteMessageBatchRequest = {
  //  Entries: [
  //    {
  //      Id: event.Records[0].messageId,
  //      ReceiptHandle: event.Records[0].receiptHandle,
  //    },
  //  ],
  //  QueueUrl: process.env.PENDING_PAYMENT_QUEUE || '',
  //};
  //
  //try {
  //  await sqs.deleteMessageBatch(deleteParams).promise();
  //  console.log('Message deleted from queue');
  //} catch (error) {
  //  console.error('Error deleting message from queue:', error);
  //}

};

