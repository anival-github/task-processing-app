// src/handlers/processTask.js
import { ddbDocClient } from '../utils/awsClients.js';
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;
const FAILURE_RATE = 0.30; // 30% failure rate

export const handler = async (event) => {
    // Input from Step Function is the task item
    console.log('Received event from Step Function:', JSON.stringify(event, null, 2));
    const taskItem = event; // Input is the state itself (the task item)
    const taskId = taskItem.taskId;

    if (!taskId) {
        throw new Error('Missing taskId in Step Function input');
    }

    console.log(`Processing task: ${taskId}, Answer: ${taskItem.answer}`);

    try {
        // Simulate processing based on answer or other logic
        // ...

        // Simulate random failure
        if (Math.random() < FAILURE_RATE) {
            console.warn(`Simulating processing failure for task: ${taskId}`);
            // Throw a specific error type if needed for Step Function error handling
            throw new Error('Simulated Processing Failure'); 
        }

        // If successful, update DynamoDB status to Processed
        console.log(`Processing successful for task: ${taskId}`);
        const updateParams = {
            TableName: TASKS_TABLE_NAME,
            Key: { taskId },
            UpdateExpression: "set #status = :status, updatedAt = :updatedAt, errorMessage = :errMsg",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
                ":status": "Processed",
                ":updatedAt": new Date().toISOString(),
                ":errMsg": null // Clear any previous error message
            },
            ReturnValues: "UPDATED_NEW",
        };
        console.log('Updating task status to Processed in DynamoDB:', updateParams);
        await ddbDocClient.send(new UpdateCommand(updateParams));
        console.log(`Task ${taskId} status updated to Processed`);

        // Return result to Step Function (optional)
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Task processed successfully', taskId: taskId }),
        };

    } catch (error) {
        console.error(`Error during processing task ${taskId}:`, error);
        // Re-throw the error to let Step Functions handle retries/catch
        // The error message might be passed to the Catch state
        error.message = `Processing task ${taskId} failed: ${error.message}`; 
        throw error;
    }
};
