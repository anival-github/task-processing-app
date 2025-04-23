import { ddbDocClient } from '../utils/awsClients.js';
import { PutCommand } from "@aws-sdk/lib-dynamodb";

const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME;

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    console.log(`Connect invoked for connectionId: ${connectionId}`);

    const params = {
        TableName: CONNECTIONS_TABLE_NAME,
        Item: {
            connectionId: connectionId,
            connectedAt: new Date().toISOString()
        }
    };

    try {
        console.log('Storing connectionId in DynamoDB:', params);
        await ddbDocClient.send(new PutCommand(params));
        console.log(`ConnectionId ${connectionId} stored.`);
        return { statusCode: 200, body: 'Connected.' };
    } catch (error) {
        console.error(`Failed to store connectionId ${connectionId}:`, error);
        return { statusCode: 500, body: 'Failed to connect.' };
    }
};
