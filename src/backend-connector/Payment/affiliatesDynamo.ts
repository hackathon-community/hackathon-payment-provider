export async function getAffiliateInfo({
  table,
  dbClient,
  id,
}: {
  table: string;
  dbClient: any;
  id: string;
}) {
  const params = {
    TableName: table,
    /* Item properties will depend on your application concerns */
    Key: {
      id: id,
    },
  };
  try {
    const data = await dbClient.get(params).promise();
    return {
      id,
      purchaserRecipientId: data.purchaserRecipientId,
      document: data.document,
    };
  } catch (err) {
    return undefined;
  }
}
