# Serverless http task manager

Reliable and scalable serverless based http-task manager using data stream processing. Can handle a big amount of requests by using event data streams with customized batch size processing. It supports asynchronous event driven callbacks and retries.

## Deployment

Just follow the serverless-framework [deployment setup](https://serverless.com/framework/docs/providers/aws/guide/deploying/) and execute the following command:

```bash
npm run deploy <environment-name>
```

After the deployment you will the following endpoint availability:

```text
endpoints:
  POST - https://xxx.execute-api.eu-central-1.amazonaws.com/xx/task/add
  GET - https://xxx.execute-api.eu-central-1.amazonaws.com/xx/task/result/{id}
```