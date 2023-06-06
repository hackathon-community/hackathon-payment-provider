import { APIGatewayProxyEventV2, APIGatewayProxyResultV2 } from "aws-lambda";
import AWS from "aws-sdk";
const TABLE_AFFLIATES = process.env.TABLE_AFFLIATES;
const ddbResource = new AWS.DynamoDB.DocumentClient();

export const createAffiliate = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  if (!event.body) {
    throw new Error("No body found");
  }
  const requestBody = JSON.parse(event.body) as {
    document: string;
    email: string;
  }; // criar interface para o payload que deve ser enviado

  const documentAffiliate = requestBody["document"].replace(/\D/g, "");

  const payloadStripe = {
    document: documentAffiliate,
    email: requestBody.email,
    //etc
  };
  const stripeId = "";
  /* Make stripe request */
  // await axios.post()

  // Depois de Criar Affiliado na Stripe Execute isto

  const payloadVtex = {
    document: documentAffiliate,
    email: requestBody.email,
    //etc
  };
  const vtexId = "";
  /* Make stripe request */
  // await axios.post('https://vtexdayhackathon.vtexcommercestable.com.br/_v/affiliate', payloadVtex, { appKey e appToken no header })

  // Depois de criar afiliado na vtex execute isso
  const itemsDict = {
    id: vtexId,
    document: documentAffiliate,
    purchaserRecipientId: stripeId,
  };
  try {
    const data = await ddbResource
      .put({
        TableName: TABLE_AFFLIATES,
        Item: itemsDict,
        ReturnValues: "NONE",
        ReturnConsumedCapacity: "TOTAL",
        ConditionExpression:
          "attribute_not_exists(document) or attribute_not_exists(id)",
      })
      .promise();

    return {
      body: "Affiliado criado com sucesso.",
      statusCode: 200,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
    };
  } catch (err) {
    return {
      body: "Ocorreu um erro com a sua requisição.",
      statusCode: 400,
      headers: {
        "Access-Control-Allow-Headers": "Content-Type",
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "OPTIONS,POST,GET",
      },
    };
  }
};
