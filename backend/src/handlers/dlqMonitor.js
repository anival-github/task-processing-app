export const handler = async (event) => {
    console.log('Received event from DLQ:', JSON.stringify(event, null, 2));

    for (const record of event.Records) {
        try {
            const messageBody = record.body;
            console.error(`[DLQ Monitor] Received failed message: ${messageBody}`);
        } catch (error) {
            console.error('[DLQ Monitor] Error processing DLQ record:', error);
        }
    }

    return { statusCode: 200, body: 'DLQ messages processed.' };
};
