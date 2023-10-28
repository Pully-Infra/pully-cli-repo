const { CONFIG, GENERAL_CONFIG } = require("../config/config");

const {
  LambdaClient,
  GetFunctionCommand,
  DeleteFunctionCommand,
  CreateFunctionCommand,
  UpdateFunctionCodeCommand,
} = require("@aws-sdk/client-lambda");
const { GetCallerIdentityCommand, STSClient } = require("@aws-sdk/client-sts");

const client = new LambdaClient(GENERAL_CONFIG);
const stsClient = new STSClient(GENERAL_CONFIG);

const lambdaRole = CONFIG.LAMBDA_ROLE;

class LambdaService {
  async create(params) {
    const { functionName, s3Bucket = CONFIG.BUCKET_NAME, s3Key } = params;

    const stsCommand = new GetCallerIdentityCommand({});
    const stsResponse = await stsClient.send(stsCommand);

    try {
      const input = {
        Code: {
          S3Key: s3Key,
          S3Bucket: s3Bucket,
        },
        Timeout: 900,
        MemorySize: 128,
        Runtime: "nodejs18.x",
        Handler: "index.handler",
        FunctionName: functionName,
        Role: `arn:aws:iam::${stsResponse.Account}:role/${lambdaRole}`,
        Description: `The code for the ${functionName} lambda function.`,
      };

      const command = new CreateFunctionCommand(input);
      const response = await this.client.send(command);
      return response.FunctionArn;
    } catch (err) {
      throw new Error(err);
    }
  }

  async delete(functionName) {
    const params = {
      FunctionName: functionName,
    };

    const command = new DeleteFunctionCommand(params);
    const response = await this.client.send(command);
    return response.$metadata;
  }

  async update(s3Key, functionName, s3Bucket = CONFIG.BUCKET_NAME) {
    const params = {
      S3Key: s3Key,
      S3Bucket: s3Bucket,
      FunctionName: functionName,
    };

    const command = new UpdateFunctionCodeCommand(params);
    const response = await this.client.send(command);
    return response.FunctionArn;
  }

  async functionExists(functionName) {
    try {
      const command = new GetFunctionCommand({
        FunctionName: functionName,
      });

      await this.client.send(command);
      return true;
    } catch (err) {
      return false;
    }
  }

  constructor() {
    this.client = client;
  }
}

module.exports = LambdaService;
