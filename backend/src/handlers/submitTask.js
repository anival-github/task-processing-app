import { ddbDocClient, sqsClient } from '../utils/awsClients.js';
import { PutCommand } from "@aws-sdk/lib-dynamodb";
import { SendMessageCommand } from "@aws-sdk/client-sqs";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;
const TASK_QUEUE_URL = process.env.TASK_QUEUE_URL;

export const handler = async (event) => {
    console.log('Received event:', JSON.stringify(event, null, 2));

    let requestBody;
    try {
        requestBody = JSON.parse(event.body);
        if (!requestBody || typeof requestBody.answer !== 'string' || requestBody.answer.trim() === '' || typeof requestBody.taskId !== 'string' || requestBody.taskId.trim() === '') {
            throw new Error('Invalid input: Missing or empty answer or taskId field.');
        }
    } catch (error) {
        console.error('Invalid request body:', error);
        return {
            statusCode: 400,
            body: JSON.stringify({ message: 'Invalid request body: ' + error.message }),
            headers: { 'Content-Type': 'application/json' }
        };
    }

    const taskId = requestBody.taskId;
    const timestamp = new Date().toISOString();
    const taskItem = {
        taskId: taskId,
        answer: requestBody.answer.trim(),
        status: 'Pending',
        retries: 0,
        createdAt: timestamp,
        updatedAt: timestamp,
    };

    try {
        const putParams = {
            TableName: TASKS_TABLE_NAME,
            Item: taskItem,
            ConditionExpression: 'attribute_not_exists(taskId)'
        };
        console.log('Putting item into DynamoDB:', putParams);
        await ddbDocClient.send(new PutCommand(putParams));
        console.log('Successfully put item into DynamoDB');

        const sqsParams = {
            QueueUrl: TASK_QUEUE_URL,
            MessageBody: JSON.stringify({ taskId: taskId })
        };
        console.log('Sending message to SQS:', sqsParams);
        await sqsClient.send(new SendMessageCommand(sqsParams));
        console.log('Successfully sent message to SQS');

        return {
            statusCode: 201,
            body: JSON.stringify({ taskId: taskId, message: 'Task submitted successfully' }),
            headers: { 'Content-Type': 'application/json' }
        };

    } catch (error) {
        console.error('Error processing submission:', error);
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to submit task', error: error.message }),
            headers: { 'Content-Type': 'application/json' }
        };
    }
};
