import { ddbDocClient } from '../utils/awsClients.js';
import { UpdateCommand } from "@aws-sdk/lib-dynamodb";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;

export const handler = async (event) => {
    console.log('Received event from Step Function Catch:', JSON.stringify(event, null, 2));

    const taskData = event;
    const errorInfo = event.errorInfo;
    const taskId = taskData?.taskId;

    if (!taskId) {
        console.error('Invalid input: Missing taskId in event root');
        throw new Error('Invalid input: Missing taskId');
    }

    let errorMessage = 'Unknown processing error after retries';
    if (errorInfo) {
        try {
            const cause = JSON.parse(errorInfo.Cause || '{}');
            errorMessage = cause.errorMessage || errorInfo.Cause || 'Failed after retries';
        } catch (e) {
            errorMessage = typeof errorInfo.Cause === 'string' ? errorInfo.Cause : 'Failed after retries (undetailed)';
        }
    }
    errorMessage = errorMessage.substring(0, 500);

    console.log(`Handling failure for task: ${taskId}, Error: ${errorMessage}`);

    const updateParams = {
        TableName: TASKS_TABLE_NAME,
        Key: { taskId },
        UpdateExpression: "set #status = :status, updatedAt = :updatedAt, errorMessage = :errMsg, retries = :retries", 
        ExpressionAttributeNames: { "#status": "status" },
        ExpressionAttributeValues: {
            ":status": "Failed",
            ":updatedAt": new Date().toISOString(),
            ":errMsg": errorMessage,
            ":retries": 2 
        },
        ReturnValues: "UPDATED_NEW",
    };

    try {
        console.log('Updating task status to Failed in DynamoDB:', updateParams);
        await ddbDocClient.send(new UpdateCommand(updateParams));
        console.log(`Task ${taskId} status updated to Failed`);

        return { 
            taskInput: taskData, 
            errorInfo: errorInfo 
        };
    } catch (error) {
        console.error(`Error updating task ${taskId} to Failed status:`, error);
        throw error;
    }
}; 