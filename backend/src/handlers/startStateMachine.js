import { ddbDocClient, sfnClient } from '../utils/awsClients.js';
import { GetCommand } from "@aws-sdk/lib-dynamodb";
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

            if (taskItem.status !== 'Pending') {
                console.warn(`Task ${taskId} is not in Pending state (current: ${taskItem.status}). Skipping state machine start.`);
                continue;
            }

            const sfnParams = {
                stateMachineArn: STEP_FUNCTIONS_ARN,
                input: JSON.stringify(taskItem),
                name: `Task-${taskId}-${Date.now()}`
            };
            console.log('Starting Step Function execution:', sfnParams);
            await sfnClient.send(new StartExecutionCommand(sfnParams));
            console.log(`Successfully started Step Function execution for taskId: ${taskId}`);

        } catch (error) {
            console.error(`Error processing taskId ${taskId || 'unknown'} from SQS record ${record.messageId}:`, error);
            throw new Error(`Failed to process SQS message for taskId ${taskId}: ${error.message}`);
        }
    }
};
