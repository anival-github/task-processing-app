import { ddbDocClient } from '../utils/awsClients.js';
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;

export const handler = async (event) => {
    console.log('Received event from Step Function Catch:', JSON.stringify(event, null, 2));

    // Extract original task input and error details from the event
    const taskInput = event.TaskInput;
    const errorInfo = event.ErrorInfo;

    if (!taskInput || !taskInput.taskId) {
        console.error('Invalid input: Missing TaskInput or taskId');
        // Cannot update status without taskId, potentially log or raise alert
        return { statusCode: 400, body: 'Invalid input' }; 
    }

    const taskId = taskInput.taskId;
    // Attempt to extract a cleaner error message
    let errorMessage = 'Unknown processing error after retries';
    if (errorInfo) {
        try {
            const cause = JSON.parse(errorInfo.Cause || '{}');
            errorMessage = cause.errorMessage || errorInfo.Cause || 'Failed after retries';
        } catch (e) {
            errorMessage = errorInfo.Cause || 'Failed after retries (undetailed)';
        }
    }
    // Truncate long error messages if necessary
    errorMessage = errorMessage.substring(0, 500); 

    console.log(`Handling failure for task: ${taskId}, Error: ${errorMessage}`);

    // Update DynamoDB status to Failed and record error message
    const updateParams = {
        TableName: TASKS_TABLE_NAME,
        Key: { taskId },
        UpdateExpression: "set #status = :status, updatedAt = :updatedAt, errorMessage = :errMsg",
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
            ":status": "Failed",
            ":updatedAt": new Date().toISOString(),
            ":errMsg": errorMessage,
        },
        ReturnValues: "UPDATED_NEW",
    };

    try {
        console.log('Updating task status to Failed in DynamoDB:', updateParams);
        await ddbDocClient.send(new UpdateCommand(updateParams));
        console.log(`Task ${taskId} status updated to Failed`);

        return { 
            statusCode: 200, 
            body: JSON.stringify({ message: 'Failure handled successfully', taskId: taskId })
        };
    } catch (error) {
        console.error(`Error updating task ${taskId} to Failed status:`, error);
        // This is a secondary failure, log it carefully
        // Depending on requirements, might want to retry or alert
        return {
            statusCode: 500,
            body: JSON.stringify({ message: 'Failed to update task status after processing failure', error: error.message })
        };
    }
}; 