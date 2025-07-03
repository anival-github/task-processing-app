# Task Processing App

A full-stack application with Angular frontend and Node.js backend, designed as a fault-tolerant, event-driven system for processing tasks.

## Project Structure

- `/frontend` - Angular 15 application with NGXS, implementing the user interface.
- `/backend` - Node.js Serverless Framework application (AWS Lambda, API Gateway, SQS, Step Functions, DynamoDB), handling task processing and persistence.

## Architecture Overview

See [docs/architecture.md](docs/architecture.md) for details on the system architecture.

## Prerequisites

- Node.js (v18 or higher recommended)
- npm (v8 or higher recommended)
- Angular CLI (v15) (`npm install -g @angular/cli@15`)
- AWS Account and configured credentials (for backend deployment)
- Serverless Framework (v3) (`npm install -g serverless@3`)

## Setup and Running

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/anival-github/test-app.git
    cd test-app
    ```

2.  **Backend Setup:**
    - Navigate to the backend directory:
      ```bash
      cd backend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Deploy the service to AWS:
      ```bash
      serverless deploy
      ```
      *Note: Take note of the API Gateway endpoint URL (`apiUrl`) and WebSocket URL (`wsUrl`) provided after deployment.* 

    - If needed - navigate back to the root directory:
      ```bash
      cd .. 
      ```

3.  **Frontend Setup & Configuration:**
    - Navigate to the frontend directory:
      ```bash
      cd frontend
      ```
    - Install dependencies:
      ```bash
      npm install
      ```
    - Configure the backend endpoints in `frontend/src/environments/environment.ts` using the URLs from the backend deployment:
      - Set `apiUrl` 
      - Set `wsUrl`
    
4.  **Run the Frontend:**
    - While in the `/frontend` directory:
      ```bash
      ng serve
      ```
    - The application will be available at `http://localhost:4200`.

## Testing

You will be able to interact with the frontend application to check all its features. 

In order to test mobile view, you need to open developer tools in the browser, and set the device you want to test, or manually adjust the screen size. 

## Assumptions and Challenges

### Assumptions
User opens the page on a particular device. That is why the screen size is captured once when the page is opened. 

### Challenges
There is a space to improve reusability for the frontend components, which would require additional effort. 
 
