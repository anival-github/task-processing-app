// src/handlers/processTask.js
import { ddbDocClient } from '../utils/awsClients.js';
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;
const FAILURE_RATE = 1.0; // Temporarily set to 100% failure rate for testing

export const handler = async (event) => {
    // Input from Step Function includes TaskInput and RetryCount
    console.log('Received event from Step Function:', JSON.stringify(event, null, 2));
    const taskInput = event.TaskInput; 
    const retryCount = event.RetryCount || 0; // Default to 0 if not present
    const taskId = taskInput?.taskId;

    if (!taskId) {
        throw new Error('Missing taskId in Step Function input.TaskInput');
    }

    // --- Update retry count in DB at the start of each attempt (if retryCount > 0) ---
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
            ReturnValues: "NONE", // Don't need return values here
        };
        try {
            await ddbDocClient.send(new UpdateCommand(retryUpdateParams));
            console.log(`Successfully updated retry count to ${retryCount} for task ${taskId}.`);
        } catch (dbError) {
            console.error(`Failed to update retry count for task ${taskId} before processing:`, dbError);
            // Throw error to potentially trigger SFN retry for the DB update failure itself
            throw new Error(`Failed to update retry count in DB: ${dbError.message}`);
        }
    }
    // --- End retry count update ---

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
        const successUpdateParams = {
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
        console.log('Updating task status to Processed in DynamoDB:', successUpdateParams);
        await ddbDocClient.send(new UpdateCommand(successUpdateParams));
        console.log(`Task ${taskId} status updated to Processed`);

        // Return result to Step Function (optional)
        return {
            statusCode: 200,
            body: JSON.stringify({ message: 'Task processed successfully', taskId: taskId }),
        };

    } catch (error) {
        console.error(`Error during processing task ${taskId}:`, error);
        // Re-throw the error to let Step Functions handle retries/catch
        if (!(error instanceof Error)) { // Ensure it's an Error object
             error = new Error(String(error));
        }
        // Avoid modifying original message if it's the DB update error
        if (!error.message.startsWith('Failed to update retry count')) {
             error.message = `Processing task ${taskId} failed: ${error.message}`;
        } 
        throw error;
    }
};
