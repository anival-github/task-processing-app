import { DynamoDBClient } from "@aws-sdk/client-dynamodb";
import { DynamoDBDocumentClient } from "@aws-sdk/lib-dynamodb";
import { SQSClient } from "@aws-sdk/client-sqs";
import { SFNClient } from "@aws-sdk/client-sfn";
import { ApiGatewayManagementApiClient } from "@aws-sdk/client-apigatewaymanagementapi";

const region = process.env.AWS_REGION || 'us-east-1';

const ddbClient = new DynamoDBClient({ region });
const ddbDocClient = DynamoDBDocumentClient.from(ddbClient);

const sqsClient = new SQSClient({ region });

const sfnClient = new SFNClient({ region });

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