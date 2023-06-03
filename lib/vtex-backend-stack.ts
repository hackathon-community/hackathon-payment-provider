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

  // Create Manifest Lambda function
  const Manifest = new NodejsFunction(scope, "Manifest", {
    memorySize: 128,
    timeout: Duration.seconds(5),
    runtime: Runtime.NODEJS_16_X,
    handler: 'handler',
    entry: path.join(__dirname, "/../src/backend-connector/Manifest/handler.ts"),
    bundling: {
      minify: true
    },
    environment: {
      TABLE_NAME: PaymentTrackTable.tableName
    },
  });

  // create Lambda Proxy Integration and resource, and add integration to api resource
  const ManifestLambdaIntegration = new LambdaIntegration(Manifest);
  const ManifestResource = PaymentApi.root.addResource("manifest");
  ManifestResource.addMethod("GET", ManifestLambdaIntegration);

  // Create Payment Lambda function
  const Payment = new NodejsFunction(scope, "Payment", {
    memorySize: 128,
    timeout: Duration.seconds(5),
    runtime: Runtime.NODEJS_16_X,
    handler: 'handler',
    entry: path.join(__dirname, "/../src/backend-connector/Payment/handler.ts"),
    bundling: {
      minify: true
    },
    environment: {
      TABLE_NAME: PaymentTrackTable.tableName
    },
  });

  // create Lambda Proxy Integration and resource, and add integration to api resource
  const PaymentLambdaIntegration = new LambdaIntegration(Payment);
  const PaymentResource = PaymentApi.root.addResource("payments");
  PaymentResource.addMethod("POST", PaymentLambdaIntegration);
  PaymentTrackTable.grantReadWriteData(Payment);

  // Create Cancellation Lambda function
  const Cancellation = new NodejsFunction(scope, "Cancellation", {
    memorySize: 128,
    timeout: Duration.seconds(5),
    runtime: Runtime.NODEJS_16_X,
    handler: 'handler',
    entry: path.join(__dirname, "/../src/backend-connector/Cancellation/handler.ts"),
    bundling: {
      minify: true
    },
    environment: {
      TABLE_NAME: PaymentTrackTable.tableName
    },
  });

  // create Lambda Proxy Integration and resource, and add integration to api resource
  const CancellationLambdaIntegration = new LambdaIntegration(Cancellation);
  const CancellationResource = PaymentApi.root.addResource("cancellations");
  CancellationResource.addMethod("POST", CancellationLambdaIntegration);
  PaymentTrackTable.grantReadWriteData(Cancellation);

  // Create Settlement Lambda function
  const Settlement = new NodejsFunction(scope, "Settlement", {
    memorySize: 128,
    timeout: Duration.seconds(5),
    runtime: Runtime.NODEJS_16_X,
    handler: 'handler',
    entry: path.join(__dirname, "/../src/backend-connector/Settlement/handler.ts"),
    bundling: {
      minify: true
    },
    environment: {
      TABLE_NAME: PaymentTrackTable.tableName
    },
  });

  // create Lambda Proxy Integration and resource, and add integration to api resource
  const SettlementLambdaIntegration = new LambdaIntegration(Settlement);
  const SettlementResource = PaymentApi.root.addResource("settlements");
  SettlementResource.addMethod("POST", SettlementLambdaIntegration);
  PaymentTrackTable.grantReadWriteData(Settlement);

  // Create Refund Lambda function
  const Refund = new NodejsFunction(scope, "Refund", {
    memorySize: 128,
    timeout: Duration.seconds(5),
    runtime: Runtime.NODEJS_16_X,
    handler: 'handler',
    entry: path.join(__dirname, "/../src/backend-connector/Refund/handler.ts"),
    bundling: {
      minify: true
    },
    environment: {
      TABLE_NAME: PaymentTrackTable.tableName
    },
  });

  // create Lambda Proxy Integration and resource, and add integration to api resource
  const RefundLambdaIntegration = new LambdaIntegration(Refund);
  const RefundResource = PaymentApi.root.addResource("refunds");
  RefundResource.addMethod("POST", RefundLambdaIntegration);
  PaymentTrackTable.grantReadWriteData(Refund);


  /////// PERMISSIONS

  //Provide access to Lambdas on PaymentTrackTable
  //PaymentTrackTable.grantReadWriteData(PendingPaymentStream);
  //PaymentTrackTable.grantReadWriteData(ProcessPendingPayment);
  //PaymentTrackTable.grantStreamRead(PendingPaymentStream);

  //Provide access to PendingPaymentStream on
  //PendingPaymentQueue.grantSendMessages(PendingPaymentStream);
  //PendingPaymentQueue.grantConsumeMessages(ProcessPendingPayment);
}