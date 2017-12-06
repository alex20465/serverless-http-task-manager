# Serverless http task manager

Reliable and scalable serverless based http-task manager using data stream executions. Can handle a larnge amount of tasks by using event data streams. It supports asynchronous event driven callbacks and retries.

## Features

- Execution retries
- Asynchronous executions (asynch strategy)
- No-blocking, totally event-driven
- Scalable

## Deployment

Just follow the serverless-framework [deployment setup](https://serverless.com/framework/docs/providers/aws/guide/deploying/) and execute the following command:

```bash
npm install
npm run deploy <environment-name>
```

After the deployment you will the following endpoint availability:

```text
endpoints:
  POST - https://xxx.execute-api.xxx.amazonaws.com/xx/task/add
  POST - https://xxx.execute-api.xxx.amazonaws.com/xx/task/callback/{id}
  GET - https://xxx.execute-api.xxx.amazonaws.com/xx/task/result/{id}
```

## Examples

### await execution strategy:

The await execution strategy performs a simple request and handles the response as the result. Once
the result is available, the callback execution follows.

Activities:

Put task -> execute task -> execute callback

POST /dev/task/add HTTP/1.1

```json
{
  "request": {
    "uri": "https://you-endpoint-to-process-input.com",
    "method": "post",
    "body": "your input to process"
  },
  "callback": {
    "uri": "https://your-endpoint-to-callback-after-input-is-processed.com",
    "method": "post"
  }
}
```

The response should look similar to the following:

```json
{
    "request": {
        "uri": "https://you-endpoint-to-process-input.com",
        "method": "post",
        "body": "your input to process",
        "headers": [
            {
                "key": "Accept",
                "value": "application/json"
            }
        ]
    },
    "callback": {
        "uri": "https://your-endpoint-to-callback-after-input-is-processed.com",
        "method": "post",
        "body": "{}",
        "headers": [
            {
                "key": "Accept",
                "value": "application/json"
            }
        ]
    },
    "strategy": "await",
    "id": "4f855561-8fe5-41d0-94ac-e0537c7c419b"
}
```

Once the request has been performed, the task-manager executes the callback endpoint with the processed data as body.
