// src/handlers/getTasks.js
import { ddbDocClient } from '../utils/awsClients.js';
import { ScanCommand } from "@aws-sdk/lib-dynamodb";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    const params = {
        TableName: TASKS_TABLE_NAME,
        // Add projection expression if you only need specific fields
        // ProjectionExpression: "taskId, answer, #st, retries, errorMessage",
        // ExpressionAttributeNames: { "#st": "status" }, // Alias for reserved keyword 'status'
    };

    try {
        console.log('Scanning DynamoDB table:', params);
        const data = await ddbDocClient.send(new ScanCommand(params));
        console.log('Scan successful. Items count:', data.Items?.length || 0);

        return {
            statusCode: 200,
            body: JSON.stringify(data.Items || []),
            headers: { 
                'Content-Type': 'application/json',
                // Add CORS headers if not handled by API Gateway integration
                // 'Access-Control-Allow-Origin': '*',
            }
        };
    } catch (error) {
        console.error('Error scanning DynamoDB:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to retrieve tasks', error: error.message }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
