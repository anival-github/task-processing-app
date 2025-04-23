export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const messageBody = event.body;

    console.log(`Default handler invoked for connectionId: ${connectionId}`);
    console.log('Received message:', messageBody);

    return { statusCode: 200, body: 'Message received.' };
};
