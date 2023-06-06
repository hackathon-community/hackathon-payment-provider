// Use this code snippet in your app.
// If you need more information about configurations or implementing the sample code, visit the AWS docs:
// https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/getting-started.html
import AWS from "aws-sdk";
export async function getSecret() {
  const secret_name = "CHAVE-STRIPE";

  const client = new AWS.SecretsManager({
    region: "us-east-1",
  });

  let response;

  try {
    response = await client
      .getSecretValue({
        SecretId: secret_name,
      })
      .promise();
  } catch (error) {
    // For a list of exceptions thrown, see
    // https://docs.aws.amazon.com/secretsmanager/latest/apireference/API_GetSecretValue.html
    throw error;
  }

  return JSON.parse(response.SecretString);
  // Your code goes here
}
