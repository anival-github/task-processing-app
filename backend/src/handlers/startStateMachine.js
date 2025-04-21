// src/handlers/startStateMachine.js
import { ddbDocClient, sfnClient } from '../utils/awsClients.js';
import { GetCommand, UpdateCommand } from "@aws-sdk/lib-dynamodb";
import { StartExecutionCommand } from "@aws-sdk/client-sfn";

const TASKS_TABLE_NAME = process.env.TASKS_TABLE_NAME;
const STEP_FUNCTIONS_ARN = process.env.STEP_FUNCTIONS_ARN;

export const handler = async (event) => {
    console.log('Received SQS event:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        let taskId;
        try {
            const body = JSON.parse(record.body);
            taskId = body.taskId;

            if (!taskId) {
                throw new Error('Missing taskId in SQS message body');
            }
            console.log(`Processing taskId: ${taskId}`);

            // 1. Get task details from DynamoDB
            const getParams = {
                TableName: TASKS_TABLE_NAME,
                Key: { taskId },
            };
            console.log('Getting task item from DynamoDB:', getParams);
            const { Item: taskItem } = await ddbDocClient.send(new GetCommand(getParams));

            if (!taskItem) {
                throw new Error(`Task not found in DynamoDB for taskId: ${taskId}`);
            }
            console.log('Retrieved task item:', taskItem);

            // Prevent starting state machine if already processing or finished
            if (taskItem.status !== 'Pending') {
                console.warn(`Task ${taskId} is not in Pending state (current: ${taskItem.status}). Skipping state machine start.`);
                // Consider deleting the SQS message if it shouldn't be retried
                continue; // Move to next record
            }

            // 2. Update task status to 'Processing'
            const updateParams = {
                TableName: TASKS_TABLE_NAME,
                Key: { taskId },
                UpdateExpression: "set #status = :status, updatedAt = :updatedAt",
                ExpressionAttributeNames: { "#status": "status" }, // Alias for reserved keyword
                ExpressionAttributeValues: {
                    ":status": "Processing",
                    ":updatedAt": new Date().toISOString(),
                },
                ReturnValues: "UPDATED_NEW", // Optional: return updated values
            };
            console.log('Updating task status to Processing in DynamoDB:', updateParams);
            await ddbDocClient.send(new UpdateCommand(updateParams));
            console.log(`Task ${taskId} status updated to Processing`);

            // 3. Start Step Function execution
            const sfnParams = {
                stateMachineArn: STEP_FUNCTIONS_ARN,
                input: JSON.stringify(taskItem), // Pass the full task item as input
                name: `Task-${taskId}-${Date.now()}` // Optional: unique execution name
            };
            console.log('Starting Step Function execution:', sfnParams);
            await sfnClient.send(new StartExecutionCommand(sfnParams));
            console.log(`Successfully started Step Function execution for taskId: ${taskId}`);

            // Message will be automatically deleted from SQS on successful Lambda execution

        } catch (error) {
            console.error(`Error processing taskId ${taskId || 'unknown'} from SQS record ${record.messageId}:`, error);
            // Throw error to signal SQS to handle retries/DLQ based on queue configuration
            // Do NOT delete the message here if processing failed
            throw new Error(`Failed to process SQS message for taskId ${taskId}: ${error.message}`);
        }
    }
};
