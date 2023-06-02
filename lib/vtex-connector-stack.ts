import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import { configureBackend } from './vtex-backend-stack';
import { configureFrontend } from './vtex-frontend-stack';

export class VtexConnectorStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    configureFrontend(this);
    configureBackend(this);

  }
}
