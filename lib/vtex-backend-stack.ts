import { Duration } from 'aws-cdk-lib';
import { LambdaIntegration, RestApi, Cors } from 'aws-cdk-lib/aws-apigateway';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import { NodejsFunction } from 'aws-cdk-lib/aws-lambda-nodejs';
import * as path from 'path';

export const configureBackend = (scope: any) => {

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
  const User = new NodejsFunction(scope, "User", {
    memorySize: 128,
    timeout: Duration.seconds(5),
    runtime: Runtime.NODEJS_16_X,
    handler: 'handler',
    entry: path.join(__dirname, "/../src/backend-front/User/handler.ts"),
    bundling: {
      minify: true
    }
  });

  // create Lambda Proxy Integration and resource, and add integration to api resource
  const UserApiLambdaIntegration = new LambdaIntegration(User);
  const UserApiResource = PaymentApi.root.addResource("user");
  UserApiResource.addMethod("POST", UserApiLambdaIntegration);
}