// src/handlers/websocketDefault.js

export const handler = async (event) => {
    const connectionId = event.requestContext.connectionId;
    const messageBody = event.body;

    console.log(`Default handler invoked for connectionId: ${connectionId}`);
    console.log('Received message:', messageBody);

    // Here you could implement logic for specific actions if needed
    // e.g., if (messageBody.action === 'ping') { /* send pong */ }

    // Simply acknowledge receipt for now
    return { statusCode: 200, body: 'Message received.' };
};
