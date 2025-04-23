import { ddbDocClient } from '../utils/awsClients.js';
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;
const FAILURE_RATE = 0.3;

export const handler = async (event) => {
    console.log('Received event from Step Function:', JSON.stringify(event, null, 2));
    const taskInput = event.TaskInput;
    const retryCount = event.RetryCount || 0;
    const taskId = taskInput?.taskId;

    if (!taskId) {
        throw new Error('Missing taskId in Step Function input.TaskInput');
    }

    if (retryCount > 0) {
        console.log(`Attempt #${retryCount + 1} for task ${taskId}. Updating retry count in DB.`);
        const retryUpdateParams = {
            TableName: TASKS_TABLE_NAME,
            Key: { taskId },
            UpdateExpression: "set retries = :retries, updatedAt = :updatedAt",
            ExpressionAttributeValues: {
                ":retries": retryCount,
                ":updatedAt": new Date().toISOString(),
            },
            ReturnValues: "NONE",
        };
        try {
            await ddbDocClient.send(new UpdateCommand(retryUpdateParams));
            console.log(`Successfully updated retry count to ${retryCount} for task ${taskId}.`);
        } catch (dbError) {
            console.error(`Failed to update retry count for task ${taskId} before processing:`, dbError);
            throw new Error(`Failed to update retry count in DB: ${dbError.message}`);
        }
    }

    console.log(`Processing task: ${taskId}, Answer: ${taskInput.answer}, Attempt: ${retryCount + 1}`);

    try {
        if (Math.random() < FAILURE_RATE) {
            console.warn(`Simulating processing failure for task: ${taskId}, Attempt: ${retryCount + 1}`);
            throw new Error('Simulated Processing Failure');
        }

        console.log(`Processing successful for task: ${taskId}, Attempt: ${retryCount + 1}`);
        const successUpdateParams = {
            TableName: TASKS_TABLE_NAME,
            Key: { taskId },
            UpdateExpression: "set #status = :status, updatedAt = :updatedAt, errorMessage = :errMsg, retries = :retries",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
                ":status": "Processed",
                ":updatedAt": new Date().toISOString(),
                ":errMsg": null,
                ":retries": retryCount
            },
            ReturnValues: "UPDATED_NEW",
        };
        console.log('Updating task status to Processed in DynamoDB:', successUpdateParams);
        await ddbDocClient.send(new UpdateCommand(successUpdateParams));
        console.log(`Task ${taskId} status updated to Processed`);

        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Task processed successfully', taskId: taskId }),
        };

    } catch (error) {
        console.error(`Error during processing task ${taskId}:`, error);
        if (!(error instanceof Error)) {
             error = new Error(String(error));
        }
        if (!error.message.startsWith('Failed to update retry count')) {
             error.message = `Processing task ${taskId} failed: ${error.message}`;
        }
        throw error;
    }
};
