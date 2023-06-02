import { Duration } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi, Cors } from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';
import * as DynamoDB from "aws-cdk-lib/aws-dynamodb";
import * as cdk from "aws-cdk-lib";
import * as sqs from "aws-cdk-lib/aws-sqs";

export const configureBackend = (scope: any) => {
  const AcquirerAPI = "testing-12345/v2"

  // Create a DynamoDB table called PaymentTrackTable
  const PaymentTrackTable = new DynamoDB.Table(scope, "PaymentTrackTable", {
    partitionKey: {
      name: "paymentId",
      type: DynamoDB.AttributeType.STRING,
    },
    tableName: "PaymentTrackTable",
    billingMode: DynamoDB.BillingMode.PAY_PER_REQUEST,
    stream: DynamoDB.StreamViewType.NEW_IMAGE,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
  });

  /////// QUEUE

  // create an SQS queue called PendingPaymentQueue
  const PendingPaymentQueue = new sqs.Queue(scope, "PendingPaymentQueue", {
    queueName: "PendingPaymentQueue",
    visibilityTimeout: cdk.Duration.seconds(30),
    receiveMessageWaitTime: cdk.Duration.seconds(10),
    retentionPeriod: cdk.Duration.days(1),
    encryption: sqs.QueueEncryption.SQS_MANAGED,
  });

  // Create an API Gateway using Lambda Proxy
  const PaymentApi = new RestApi(scope, "PaymentApi", {
    restApiName: "PaymentApi",
    description: "PaymentApi",
    deployOptions: {
      stageName: "Prod",
    },
    defaultCorsPreflightOptions: {
      allowOrigins: Cors.ALL_ORIGINS,
      allowMethods: Cors.ALL_METHODS
    }
  });

  // Create Manifest Lambda function
  const Manifest = new NodejsFunction(scope, "Manifest", {
    memorySize: 128,
    timeout: Duration.seconds(5),
    runtime: Runtime.NODEJS_16_X,
    handler: 'handler',
    entry: path.join(__dirname, "/../src/backend-connector/Manifest/handler.ts"),
    bundling: {
      minify: true
    }
  });

  // create Lambda Proxy Integration and resource, and add integration to api resource
  const ManifestLambdaIntegration = new LambdaIntegration(Manifest);
  const ManifestResource = PaymentApi.root.addResource("manifest");
  ManifestResource.addMethod("GET", ManifestLambdaIntegration);

  // Create UserPost Lambda function
  const UserApi = new NodejsFunction(scope, "User", {
    memorySize: 128,
    timeout: Duration.seconds(5),
    runtime: Runtime.NODEJS_16_X,
    handler: 'handler',
    entry: path.join(__dirname, "/../src/backend-front/User/handler.ts"),
    bundling: {
      minify: true
    },
    environment: {
      TABLE_NAME: PaymentTrackTable.tableName
    },
  });

  // create Lambda Proxy Integration and resource, and add integration to api resource
  const UserApiLambdaIntegration = new LambdaIntegration(UserApi);
  const UserApiResource = PaymentApi.root.addResource("user");
  UserApiResource.addMethod("POST", UserApiLambdaIntegration);
}