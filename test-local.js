const { handler } = require('./dist/index.js');

// Test the GET endpoint
const testGetEvent = {
    httpMethod: 'GET',
    path: '/',
    headers: {},
    queryStringParameters: null,
    body: null,
    isBase64Encoded: false,
    requestContext: {
        requestId: 'test-request-id',
        stage: 'test',
        httpMethod: 'GET',
        path: '/',
    },
};

// Test the POST endpoint
const testPostEvent = {
    httpMethod: 'POST',
    path: '/visitor',
    headers: {
        'Content-Type': 'application/json',
    },
    queryStringParameters: null,
    body: JSON.stringify({ ipAddress: '192.168.1.1' }),
    isBase64Encoded: false,
    requestContext: {
        requestId: 'test-request-id-2',
        stage: 'test',
        httpMethod: 'POST',
        path: '/visitor',
    },
};

const testContext = {
    callbackWaitsForEmptyEventLoop: false,
    functionName: 'test-function',
    functionVersion: '$LATEST',
    invokedFunctionArn: 'arn:aws:lambda:us-east-1:123456789012:function:test-function',
    memoryLimitInMB: '128',
    awsRequestId: 'test-request-id',
    logGroupName: '/aws/lambda/test-function',
    logStreamName: '2023/01/01/[$LATEST]test',
    getRemainingTimeInMillis: () => 30000,
    done: () => {},
    fail: () => {},
    succeed: () => {},
};

async function testLambda() {
    console.log('Testing Lambda function...\n');

    try {
        console.log('1. Testing GET / endpoint:');
        const getResult = await handler(testGetEvent, testContext);
        console.log('Status:', getResult.statusCode);
        console.log('Body:', getResult.body);
        console.log('Headers:', getResult.headers);
        console.log('');

        console.log('2. Testing POST /visitor endpoint:');
        const postResult = await handler(testPostEvent, testContext);
        console.log('Status:', postResult.statusCode);
        console.log('Body:', postResult.body);
        console.log('Headers:', postResult.headers);
        console.log('');

        console.log('✅ Lambda function tests completed successfully!');
    } catch (error) {
        console.error('❌ Lambda function test failed:', error);
        process.exit(1);
    }
}

testLambda();
