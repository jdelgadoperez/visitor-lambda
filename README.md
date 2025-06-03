# Visitor Lambda

This Lambda function serves the existing NestJS visitor-api application in a serverless environment.

## Features

-   **Serverless NestJS**: Runs the complete visitor-api application in AWS Lambda
-   **API Gateway Integration**: Compatible with AWS API Gateway
-   **Redis Support**: Connects to Redis for visitor data storage
-   **Validation**: Full input validation using class-validator
-   **CORS Enabled**: Ready for cross-origin requests

## Endpoints

-   `GET /` - Get visitor count
-   `POST /visitor` - Record visitor data with IP address

## Setup

1. **Install dependencies:**

    ```bash
    npm install
    ```

2. **Build the Lambda function:**

    ```bash
    npm run build
    ```

3. **Test locally:**
    ```bash
    npm run test:local
    ```

## Environment Variables

Set these environment variables in your Lambda configuration:

-   `REDIS_HOST` - Redis server hostname
-   `REDIS_PORT` - Redis server port (default: 6379)
-   `REDIS_PASSWORD` - Redis password (if required)
-   `NODE_ENV` - Environment (production/development)

## Deployment

The built Lambda function is in `dist/index.js` and can be deployed to AWS Lambda.

### AWS Lambda Configuration

-   **Runtime**: Node.js 18.x or later
-   **Handler**: `index.handler`
-   **Memory**: 512 MB (recommended)
-   **Timeout**: 30 seconds
-   **Environment Variables**: Set Redis configuration

### API Gateway Integration

Configure API Gateway to proxy all requests to the Lambda function:

-   **Integration Type**: Lambda Proxy Integration
-   **Method**: ANY
-   **Resource Path**: `/{proxy+}`

## Architecture

This Lambda function:

1. **Imports** the existing visitor-api NestJS application
2. **Wraps** it with serverless-express for Lambda compatibility
3. **Caches** the NestJS application instance for performance
4. **Handles** API Gateway events and returns proper responses

## Performance

-   **Cold Start**: ~2-3 seconds (first invocation)
-   **Warm Start**: ~50-100ms (subsequent invocations)
-   **Bundle Size**: ~5.3MB (includes all dependencies)

## Testing

The `test-local.js` script tests both endpoints:

```bash
npm run test:local
```

This will test:

-   GET / (visitor count)
-   POST /visitor (record visitor)

## Notes

-   The Lambda function reuses the existing visitor-api code without duplication
-   Redis connection is required for the application to function
-   CORS is enabled for API Gateway compatibility
-   Input validation is preserved from the original NestJS application
