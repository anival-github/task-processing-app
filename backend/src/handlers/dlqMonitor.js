// src/handlers/dlqMonitor.js

export const handler = async (event) => {
    console.log('Received event from DLQ:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        try {
            const messageBody = record.body;
            // Log the raw message body from the DLQ
            console.error(`[DLQ Monitor] Received failed message: ${messageBody}`);

            // Optionally, parse the body if it contains structured data like the original task ID
            // try {
            //     const parsedBody = JSON.parse(messageBody);
            //     if(parsedBody.taskId) {
            //         console.error(`[DLQ Monitor] Failed task ID: ${parsedBody.taskId}`);
            //         // TODO: Add more detailed logging or metrics based on taskId
            //     }
            // } catch (parseError) {
            //     console.warn('[DLQ Monitor] Could not parse DLQ message body as JSON.');
            // }

            // No need to delete the message, DLQ messages are typically kept for inspection
            // No error should be thrown here, otherwise the Lambda might retry processing the DLQ message

        } catch (error) {
            // Log any unexpected errors during the monitoring process itself
            console.error('[DLQ Monitor] Error processing DLQ record:', error);
        }
    }

    // Return success to prevent retries on the DLQ message
    return { statusCode: 200, body: 'DLQ messages processed.' };
};
