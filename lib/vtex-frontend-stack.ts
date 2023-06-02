import * as cdk from "aws-cdk-lib";
import * as s3 from "aws-cdk-lib/aws-s3";
import * as s3deploy from "aws-cdk-lib/aws-s3-deployment";
import * as cloudFront from "aws-cdk-lib/aws-cloudfront";
import path = require("path");

export const configureFrontend = (scope: any) => {
  ///////////// FRONTEND
  // Add S3 Bucket
  const s3Site = new s3.Bucket(scope, `FrontEndHackathonVTEX`, {
    bucketName: `${scope.account}-vtexday-hackathon`,
    removalPolicy: cdk.RemovalPolicy.DESTROY,
    autoDeleteObjects: true,
    websiteIndexDocument: "index.html",
    websiteErrorDocument: "index.html",
  });


  // Create Origin Access Identity and have s3 grant read access
  const oai = new cloudFront.OriginAccessIdentity(
    scope,
    `frontend-hackathon-vtex-origin-access-id`,
    {}
  );
  s3Site.grantRead(oai);

  // Create a new CloudFront Distribution
  const distribution = new cloudFront.CloudFrontWebDistribution(
    scope,
    `myreactapp-cf-distribution`,
    {
      originConfigs: [
        {
          s3OriginSource: {
            s3BucketSource: s3Site,
            originAccessIdentity: oai,
          },
          behaviors: [
            {
              isDefaultBehavior: true,
              compress: true,
              allowedMethods: cloudFront.CloudFrontAllowedMethods.ALL,
              cachedMethods:
                cloudFront.CloudFrontAllowedCachedMethods.GET_HEAD_OPTIONS,
              forwardedValues: {
                queryString: true,
                cookies: {
                  forward: "none",
                },
                headers: [
                  "Access-Control-Request-Headers",
                  "Access-Control-Request-Method",
                  "Origin",
                ],
              },
            },
          ],
        },
      ],
      comment: `myreactapp - CloudFront Distribution`,
      viewerProtocolPolicy: cloudFront.ViewerProtocolPolicy.REDIRECT_TO_HTTPS,
    }
  );

  // Setup Bucket Deployment to automatically deploy new assets and invalidate cache
  new s3deploy.BucketDeployment(
    scope,
    `frontend-hackathon-vtex-s3bucketdeployment`,
    {
      sources: [s3deploy.Source.asset(path.join(__dirname, "../src/frontend/build"))],
      destinationBucket: s3Site,
      distribution: distribution,
      distributionPaths: ["/*"],
    }
  );

  // Final CloudFront URL
  new cdk.CfnOutput(scope, "CloudFront URL", {
    value: distribution.distributionDomainName,
  });

  const enableCorsOnBucket = (bucket: s3.IBucket) => {
    const cfnBucket = bucket.node.findChild("Resource") as s3.CfnBucket;
    cfnBucket.addPropertyOverride("CorsConfiguration", {
      CorsRules: [
        {
          AllowedOrigins: ["*"],
          AllowedMethods: ["HEAD", "GET", "PUT", "POST", "DELETE"],
          ExposedHeaders: [
            "x-amz-server-side-encryption",
            "x-amz-request-id",
            "x-amz-id-2"
          ],
          AllowedHeaders: ["*"]
        }
      ]
    });
  };
  enableCorsOnBucket(s3Site);
};
