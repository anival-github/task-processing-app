# High-Level Architecture Diagram

```mermaid
graph TD
    subgraph Frontend
        FE[Angular App / NGXS]
    end

    subgraph API & Triggers
        APIGW_HTTP[API Gateway HTTP API]
        APIGW_WS[API Gateway WebSocket API]
        SQS[TaskQueue SQS]
        DDB_Stream[TasksTable DynamoDB Stream]
        DLQ[TaskDLQ SQS]
    end

    subgraph Backend Logic - Lambda
        SubmitL[submitTaskLambda]
        GetL[getTasksLambda]
        StartSFL[startStateMachineLambda]
        ProcessL[processTaskLambda]
        HandleFailL[handleFailureLambda]
        MonitorDLQL[dlqMonitorLambda]
        ConnectL[connectLambda]
        DisconnectL[disconnectLambda]
        DefaultL[defaultHandlerLambda]
        NotifyL[notifyClientsLambda]
    end

    subgraph State & Storage
        DDB_Tasks[TasksTable DynamoDB]
        DDB_Conn[ConnectionsTable DynamoDB]
        SFN[TaskProcessingStateMachine Step Function]
    end

    User --> FE
    FE -- HTTP POST /tasks --> APIGW_HTTP
    FE -- HTTP GET /tasks --> APIGW_HTTP
    FE -- WebSocket Connection --> APIGW_WS

    APIGW_HTTP -- POST /tasks --> SubmitL
    APIGW_HTTP -- GET /tasks --> GetL

    SubmitL -- Write Task --> DDB_Tasks
    SubmitL -- Send TaskId --> SQS

    GetL -- Read Tasks --> DDB_Tasks
    GetL -- Task List --> FE

    SQS -- TaskId Message --> StartSFL
    StartSFL -- Get Task --> DDB_Tasks
    StartSFL -- Start Execution --> SFN

    SFN -- Invoke --> ProcessL
    ProcessL -- Update Status (Processed) --> DDB_Tasks
    SFN -- Invoke (on Catch) --> HandleFailL
    HandleFailL -- Update Status (Failed) --> DDB_Tasks
    HandleFailL -- Send Message (via SFN Task) --> DLQ

    SQS -- Failed Message (Redrive) --> DLQ
    DLQ -- Failed Message --> MonitorDLQL
    MonitorDLQL -- Log Error --> CloudWatchLogs[(CloudWatch Logs)]

    APIGW_WS -- $connect --> ConnectL
    ConnectL -- Store connectionId --> DDB_Conn
    APIGW_WS -- $disconnect --> DisconnectL
    DisconnectL -- Delete connectionId --> DDB_Conn
    APIGW_WS -- $default --> DefaultL

    DDB_Tasks -- Task Update --> DDB_Stream
    DDB_Stream -- Task Record --> NotifyL
    NotifyL -- Get connectionIds --> DDB_Conn
    NotifyL -- Send Update via API --> APIGW_WS
    APIGW_WS -- Task Update --> FE

```

**Flow Description:**

1.  **Task Submission**: Frontend sends task details to API Gateway (HTTP), triggering `submitTaskLambda`. This Lambda saves the task (status: Pending) to DynamoDB and sends the `taskId` to SQS.
2.  **Task Fetching**: Frontend requests tasks from API Gateway (HTTP), triggering `getTasksLambda`, which scans DynamoDB.
3.  **Processing Start**: SQS triggers `startStateMachineLambda`, which fetches task details from DynamoDB and starts the Step Function execution (task remains Pending).
4.  **Step Function Execution**: The Step Function invokes `processTaskLambda`. 
5.  **Success**: `processTaskLambda` updates DynamoDB status to Processed.
6.  **Failure/Retry**: If `processTaskLambda` fails (simulated 30% chance), Step Function retries based on the policy. After retries, it invokes `handleFailureLambda` via the Catch block, which updates DynamoDB status to Failed. The Step Function then explicitly sends a message containing failure details to the TaskDLQ.
7.  **DLQ Handling**: Messages arrive in the DLQ via two paths: (a) the SQS redrive policy if initial processing via `startStateMachineLambda` fails repeatedly, or (b) explicitly sent by the Step Function after exhausting retries in the main processing flow. The DLQ triggers `dlqMonitorLambda` for logging.
8.  **WebSocket Connection**: Frontend connects via API Gateway (WebSocket). `$connect` and `$disconnect` routes trigger Lambdas to manage connection IDs in a separate DynamoDB table.
9.  **Real-time Updates**: DynamoDB Streams on the tasks table capture item modifications. This triggers `notifyClientsLambda`, which fetches all active connection IDs and pushes the updated task data to connected clients via the WebSocket API. 