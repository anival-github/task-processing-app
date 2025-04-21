// src/utils/awsClients.js
import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SFNClient } from "@aws-sdk/client-sfn";
import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";

const region = process.env.AWS_REGION || 'us-east-1';

// DynamoDB Client
const ddbClient = new DynamoDBClient({ region });
// DynamoDB Document Client (for easier interaction)
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

// SQS Client
const sqsClient = new SQSClient({ region });

// Step Functions Client
const sfnClient = new SFNClient({ region });

// API Gateway Management API Client (for WebSockets)
// Needs the specific API endpoint
const apiGatewayManagementApiClient = (endpoint) => new ApiGatewayManagementApiClient({
    region: region,
    endpoint: endpoint // e.g., https://{api_id}.execute-api.{region}.amazonaws.com/{stage}
});

export {
    ddbClient,
    ddbDocClient,
    sqsClient,
    sfnClient,
    apiGatewayManagementApiClient
}; 