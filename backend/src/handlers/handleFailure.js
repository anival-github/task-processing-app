import { ddbDocClient } from '../utils/awsClients.js';
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;

export const handler = async (event) => {
    console.log('Received event from Step Function Catch:', JSON.stringify(event, null, 2));

    // Extract original task input and error details from the event
    // The event itself is the original task data + errorInfo added by ResultPath
    const taskData = event; // Use the event itself as the base task data
    const errorInfo = event.errorInfo; // Error info is at the specified ResultPath
    const taskId = taskData?.taskId; // Read taskId from the root

    if (!taskId) {
        console.error('Invalid input: Missing taskId in event root');
        // Cannot update status without taskId, potentially log or raise alert
        throw new Error('Invalid input: Missing taskId'); // Throw error to fail the Step Function state
    }

    // Attempt to extract a cleaner error message
    let errorMessage = 'Unknown processing error after retries';
    if (errorInfo) {
        try {
            // Attempt to parse the Cause if it's a JSON string
            const cause = JSON.parse(errorInfo.Cause || '{}');
            errorMessage = cause.errorMessage || errorInfo.Cause || 'Failed after retries';
        } catch (e) {
             // Fallback if Cause is not JSON or parsing fails
            errorMessage = typeof errorInfo.Cause === 'string' ? errorInfo.Cause : 'Failed after retries (undetailed)';
        }
    }
    errorMessage = errorMessage.substring(0, 500);

    console.log(`Handling failure for task: ${taskId}, Error: ${errorMessage}`);

    // Update DynamoDB status to Failed and record error message and retry count
    const updateParams = {
        TableName: TASKS_TABLE_NAME,
        Key: { taskId },
        UpdateExpression: "set #status = :status, updatedAt = :updatedAt, errorMessage = :errMsg, retries = :retries", 
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
            ":status": "Failed",
            ":updatedAt": new Date().toISOString(), // Use current timestamp
            ":errMsg": errorMessage,
            ":retries": 2 // Set to max configured retries (MaxAttempts: 2 means 2 retries)
        },
        ReturnValues: "UPDATED_NEW",
    };

    try {
        // Only update DB
        console.log('Updating task status to Failed in DynamoDB:', updateParams);
        await ddbDocClient.send(new UpdateCommand(updateParams));
        console.log(`Task ${taskId} status updated to Failed`);

        // Return the data needed for the DLQ message by the next step
        // SendFailureToDLQ expects MessageBody.$ = "$.handleFailureOutput"
        // Pass the original task data + error info 
        return { 
            taskInput: taskData, 
            errorInfo: errorInfo 
        };
    } catch (error) {
        console.error(`Error updating task ${taskId} to Failed status:`, error);
        // Throw error so Step Function execution fails here if DB update fails
        throw error;
    }
}; 