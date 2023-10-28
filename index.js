#!/usr/bin/env node

const { PULLY_ENVIRONMENT_PATH } = require("src/utils/constants");
require("dotenv").config({ path: PULLY_ENVIRONMENT_PATH });

const { Command, program } = require("commander");
const jwtFn = require("src/commands/auth/jwt");
const { init } = require("./src/commands/init");
const { functions } = require("./src/commands/functions");
const { relationships } = require("src/commands/relationships");

program
  .name("pully")
  .description("Your interactive cli for managing pully operations")
  .version("1.0.0")
  .option("-v, --verbose", "verbose logging");

export const initFn = new Command("function")
  .description(
    `
      This command helps you deploy the pully infrastructure to your AWS Account.
      
      A couple things to note:
      - You should run this command from the working directory where you want to use the cli.
      - Navigate to your aws identity sso url and copy your authentication credentials.

      -> The first time you run this command. You would be asked if you want to deploy a new pully infratructure:
        -> If No, the process checks if you already have a pully_functions folder and creates one if not then quits.
        -> If Yes, you would be prompted to enter the following information:
          - AWS Access Key Id
          - AWS Secret Key Id
          - AWS Session Token Key
          - AWS Region
         
        -> The program makes use of these credentials to make the deployment to your AWS Account. The process is as follows:
          - Clones the deployment github repo
          - Runs npm install to install all dependencies
          - Installs cdk globally on your machine
          - Bootstraps cdk
          - Runs cdk deploy

        -> All credentials including the server address would be saved to ~/.pully/.env

      -> If you have already run a deployment but want to update credentials, then select no when asked if you want to deploy a new pully infratructure
      -> Select Yes when asked if you want to update your aws credentials
      -> Input your credentials
    `
  )
  .action(init);

initFn
  .command("access_key")
  .description("Update Access Key")
  .action(() => {});
initFn
  .command("secret_key")
  .description("Update Secret Key")
  .action(() => {});
initFn
  .command("session_token")
  .description("Update Session Token")
  .action(() => {});
initFn
  .command("region")
  .description("Update Region")
  .action(() => {});

program
  .command("jwt")
  .description("create a new authentication token")
  .action(jwtFn);
program.addCommand(initFn);
program.addCommand(functions);
program.addCommand(relationships);

program.option("-v, --verbose", "Enable verbose mode");

if (program.opts().verbose) {
  console.log("Verbose mode enabled");
}

async function main() {
  try {
    await program.parseAsync(process.argv);
  } catch (err) {
    console.error(err.message);
    program.help();
  }
}

main();
