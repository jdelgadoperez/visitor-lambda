# Lambda Deployment Guide

## Prerequisites

1. **AWS Account** with appropriate permissions
2. **AWS CLI** installed and configured
3. **Node.js 18+** installed

## Method 1: Serverless Framework (Recommended)

### Install Serverless Framework
```bash
npm install -g serverless
npm install --save-dev serverless-offline
```

### Configure Environment Variables
Create `.env` file or set environment variables:
```bash
export REDIS_HOST=your-redis-host.amazonaws.com
export REDIS_PORT=6379
export REDIS_PASSWORD=your-password  # if needed
```

### Deploy
```bash
# Deploy to dev stage
npm run build
serverless deploy --stage dev

# Deploy to production
serverless deploy --stage prod

# Deploy with custom region
serverless deploy --stage prod --region us-west-2
```

### Test Locally with Serverless Offline
```bash
npm install --save-dev serverless-offline
serverless offline
```

## Method 2: AWS CLI

### 1. Create IAM Role
```bash
aws iam create-role \
  --role-name lambda-execution-role \
  --assume-role-policy-document '{
    "Version": "2012-10-17",
    "Statement": [
      {
        "Effect": "Allow",
        "Principal": {
          "Service": "lambda.amazonaws.com"
        },
        "Action": "sts:AssumeRole"
      }
    ]
  }'

aws iam attach-role-policy \
  --role-name lambda-execution-role \
  --policy-arn arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole
```

### 2. Deploy Lambda Function
```bash
# Build and package
npm run package

# Create function (first time)
aws lambda create-function \
  --function-name visitor-lambda \
  --runtime nodejs18.x \
  --role arn:aws:iam::YOUR-ACCOUNT-ID:role/lambda-execution-role \
  --handler index.handler \
  --zip-file fileb://visitor-lambda.zip \
  --environment Variables='{REDIS_HOST=your-redis-host,REDIS_PORT=6379}' \
  --memory-size 512 \
  --timeout 30

# Update function (subsequent deployments)
npm run deploy:update
```

### 3. Create API Gateway
```bash
# Create REST API
aws apigateway create-rest-api --name visitor-api

# Configure proxy integration (manual setup required)
```

## Method 3: AWS CDK

### Install CDK
```bash
npm install -g aws-cdk
```

### CDK Stack (create `cdk-stack.ts`)
```typescript
import * as cdk from 'aws-cdk-lib';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';

export class VisitorLambdaStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    const visitorLambda = new lambda.Function(this, 'VisitorLambda', {
      runtime: lambda.Runtime.NODEJS_18_X,
      handler: 'index.handler',
      code: lambda.Code.fromAsset('dist'),
      memorySize: 512,
      timeout: cdk.Duration.seconds(30),
      environment: {
        REDIS_HOST: process.env.REDIS_HOST || 'localhost',
        REDIS_PORT: process.env.REDIS_PORT || '6379',
      },
    });

    new apigateway.LambdaRestApi(this, 'VisitorApi', {
      handler: visitorLambda,
      proxy: true,
    });
  }
}
```

## Method 4: Terraform

### Create `main.tf`
```hcl
resource "aws_lambda_function" "visitor_lambda" {
  filename         = "visitor-lambda.zip"
  function_name    = "visitor-lambda"
  role            = aws_iam_role.lambda_role.arn
  handler         = "index.handler"
  runtime         = "nodejs18.x"
  memory_size     = 512
  timeout         = 30

  environment {
    variables = {
      REDIS_HOST = var.redis_host
      REDIS_PORT = var.redis_port
    }
  }
}

resource "aws_api_gateway_rest_api" "visitor_api" {
  name = "visitor-api"
}

resource "aws_lambda_permission" "api_gateway" {
  statement_id  = "AllowAPIGatewayInvoke"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.visitor_lambda.function_name
  principal     = "apigateway.amazonaws.com"
}
```

## Environment Variables

Set these in your Lambda configuration:

| Variable | Description | Example |
|----------|-------------|---------|
| `REDIS_HOST` | Redis server hostname | `my-redis.cache.amazonaws.com` |
| `REDIS_PORT` | Redis server port | `6379` |
| `REDIS_PASSWORD` | Redis password (if required) | `your-password` |
| `NODE_ENV` | Environment | `production` |

## Testing Deployment

### Test the deployed Lambda
```bash
# Test GET endpoint
curl https://your-api-gateway-url.amazonaws.com/

# Test POST endpoint
curl -X POST https://your-api-gateway-url.amazonaws.com/visitor \
  -H "Content-Type: application/json" \
  -d '{"ipAddress": "192.168.1.1"}'
```

### Monitor Logs
```bash
# View logs
aws logs tail /aws/lambda/visitor-lambda --follow

# Or with Serverless
serverless logs -f api --tail
```

## Troubleshooting

### Common Issues

1. **Redis Connection**: Ensure Redis is accessible from Lambda VPC
2. **Memory/Timeout**: Increase if cold starts are slow
3. **Environment Variables**: Double-check Redis configuration
4. **IAM Permissions**: Ensure Lambda execution role has necessary permissions

### Performance Optimization

1. **Provisioned Concurrency**: For consistent performance
2. **VPC Configuration**: Only if Redis is in VPC
3. **Memory Allocation**: 512MB recommended for NestJS apps
