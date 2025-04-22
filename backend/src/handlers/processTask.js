// src/handlers/processTask.js
import { ddbDocClient } from '../utils/awsClients.js';
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;
const FAILURE_RATE = 0.30; // 30% failure rate

export const handler = async (event) => {
    // Input from Step Function includes TaskInput and RetryCount
    console.log('Received event from Step Function:', JSON.stringify(event, null, 2));
    const taskInput = event.TaskInput; 
    const retryCount = event.RetryCount || 0; // Default to 0 if not present
    const taskId = taskInput?.taskId;

    if (!taskId) {
        throw new Error('Missing taskId in Step Function input.TaskInput');
    }

    console.log(`Processing task: ${taskId}, Answer: ${taskInput.answer}, Attempt: ${retryCount + 1}`);

    try {
        // Simulate processing based on answer or other logic
        // ...

        // Simulate random failure
        if (Math.random() < FAILURE_RATE) {
            console.warn(`Simulating processing failure for task: ${taskId}, Attempt: ${retryCount + 1}`);
            throw new Error('Simulated Processing Failure');
        }

        // If successful, update DynamoDB status to Processed and set retries
        console.log(`Processing successful for task: ${taskId}, Attempt: ${retryCount + 1}`);
        const updateParams = {
            TableName: TASKS_TABLE_NAME,
            Key: { taskId },
            UpdateExpression: "set #status = :status, updatedAt = :updatedAt, errorMessage = :errMsg, retries = :retries",
            ExpressionAttributeNames: { "#status": "status" },
            ExpressionAttributeValues: {
                ":status": "Processed",
                ":updatedAt": new Date().toISOString(),
                ":errMsg": null, // Clear any previous error message
                ":retries": retryCount // Record the retry count for this successful attempt
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
