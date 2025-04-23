import { ddbDocClient } from '../utils/awsClients.js';
import { DeleteCommand } from "@aws-sdk/lib-dynamodb";

const CONNECTIONS_TABLE_NAME = process.env.CONNECTIONS_TABLE_NAME;

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    console.log(`Disconnect invoked for connectionId: ${connectionId}`);

    const params = {
        TableName: CONNECTIONS_TABLE_NAME,
        Key: {
            connectionId: connectionId
        }
    };

    try {
        console.log('Deleting connectionId from DynamoDB:', params);
        await ddbDocClient.send(new DeleteCommand(params));
        console.log(`ConnectionId ${connectionId} deleted.`);
        return { statusCode: 200, body: 'Disconnected.' };
    } catch (error) {
        console.error(`Failed to delete connectionId ${connectionId}:`, error);
        return { statusCode: 200, body: 'Disconnect cleanup failed but connection closed.' };
    }
};
