const {
  IAMClient,
  GetRoleCommand,
  CreateRoleCommand,
  AttachRolePolicyCommand,
} = require("@aws-sdk/client-iam");
const { GENERAL_CONFIG } = require("../config/config");

const client = new IAMClient(GENERAL_CONFIG);

class IamService {
  async createRole(roleName, policy) {
    const iamInput = {
      RoleName: roleName,
      AssumeRolePolicyDocument: policy,
    };

    const iamCommand = new CreateRoleCommand(iamInput);
    const iamResponse = await this.client.send(iamCommand);
    return iamResponse.Role?.RoleName;
  }

  async getRole(roleName) {
    const input = {
      RoleName: roleName,
    };
    const command = new GetRoleCommand(input);
    return await this.client.send(command);
  }

  async roleExists(roleName) {
    try {
      await this.getRole(roleName);
      return true;
    } catch (err) {
      return false;
    }
  }

  async updateRole(
    roleName,
    policies = [
      "arn:aws:iam::aws:policy/AmazonS3FullAccess",
      "arn:aws:iam::aws:policy/AWSLambdaExecute",
    ]
  ) {
    const iamResponse = await Promise.all(
      policies.map(async (policy) => {
        const input = {
          RoleName: roleName,
          PolicyArn: policy,
        };

        const command = new AttachRolePolicyCommand(input);
        const iamResponse = await this.client.send(command);
        return iamResponse;
      })
    );

    return iamResponse;
  }

  constructor() {
    this.client = client;
  }
}

module.exports = IamService;
