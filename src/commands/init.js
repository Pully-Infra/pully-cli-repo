const dotenv = require("dotenv");
const path = require("node:path");
const Processes = require("../helpers/processes");
const {
  REPO_NAME,
  askQuestion,
  initFunction,
  PULLY_FUNCTIONS,
  PULLY_TEST_FOLDER,
  initRelationshipJson,
  PULLY_ENVIRONMENT_PATH,
  PULLY_GLOBAL_DIRECTORY,
  PULLY_DEPLOY_DIRECTORY,
  deployNewInfraQuestions,
} = require("../utils/constants");
const FileUtils = require("../utils/fileUtils");
const {
  spinnerError,
  spinnerSuccess,
  updateSpinnerText,
} = require("../utils/spinner");
dotenv.config({ path: PULLY_ENVIRONMENT_PATH });

const { writeFile, createMultipleFolders, fileOrfolderExistsSync } = FileUtils;

const PULLY_FUNCTIONS_PATH = `${PULLY_FUNCTIONS}/${PULLY_TEST_FOLDER}`;

const createAWSCredentials = async ({
  region,
  access_key,
  secret_key,
  session_token,
}) => {
  updateSpinnerText("Setting AWS Credentials...");
  await Processes.run(`aws configure set region ${region}`);
  await Processes.run(
    `aws configure set default.aws_access_key_id ${access_key}`
  );
  await Processes.run(
    `aws configure set default.aws_secret_access_key ${secret_key}`
  );
  await Processes.run(
    `aws configure set default.aws_session_token ${session_token}`
  );
  spinnerSuccess("Credentials saved successfully");
};

const saveCredentials = async (awsCredentials) => {
  const { region, access_key, secret_key, session_token } = awsCredentials;
  const ENV_VARIABLES = `ACCESS_KEY=${access_key}\nSECRET_KEY=${secret_key}\nREGION=${region}\nSESSION_TOKEN=${session_token}`;

  await FileUtils.writeFile(PULLY_ENVIRONMENT_PATH, ENV_VARIABLES);
  await createAWSCredentials(awsCredentials);
};

const createGlobalDirectory = async () => {
  const directoryPresent = await FileUtils.fileOrfolderExistsSync(
    PULLY_GLOBAL_DIRECTORY
  );

  if (!directoryPresent) await FileUtils.createFolder(PULLY_GLOBAL_DIRECTORY);
};

const checkDeployDirectory = async () => {
  const directoryPresent = await FileUtils.fileOrfolderExistsSync(
    PULLY_DEPLOY_DIRECTORY
  );

  if (directoryPresent)
    await FileUtils.removeFolderAndContents(PULLY_DEPLOY_DIRECTORY);
};

const createPullyClientDirectories = async () => {
  updateSpinnerText("Creating pully directories...");

  // don't run the init function if some parameters exist already
  const folderPresent = await fileOrfolderExistsSync(PULLY_FUNCTIONS);
  const relationshipFilePresent = await fileOrfolderExistsSync(``);

  if (!relationshipFilePresent) {
    await writeFile(`relationships.json`, initRelationshipJson);
  }

  if (!folderPresent) {
    await createMultipleFolders(PULLY_FUNCTIONS_PATH);
    await writeFile(`${PULLY_FUNCTIONS_PATH}/index.js`, initFunction);
    spinnerSuccess("Pully directories created successfully");
  }
};

const cloneDeploymentRepo = async () => {
  await Processes.changeDir(PULLY_GLOBAL_DIRECTORY);
  updateSpinnerText("Cloning deployment repo...");
  await checkDeployDirectory();
  await Processes.run(`git clone -q ${REPO_NAME} ~/.pully/deploy`);
  spinnerSuccess("Deployment repo cloned successfully");
};

const runInstalls = async () => {
  await Processes.changeDir(PULLY_DEPLOY_DIRECTORY);
  updateSpinnerText("Installing dependencies... This may take a while.");
  await Processes.run("npm install");
  spinnerSuccess("Dependencies installed successfully");
  updateSpinnerText("Installing AWS CDK... This may take a while.");
  await Processes.run("npm install -g aws-cdk");
  spinnerSuccess("CDK installed successfully");
};

//  --context @aws-cdk/core:newStyleStackSynthesis=1 --cloudformation-execution-policies arn:aws:iam::aws:policy/AdministratorAccess

const deployInfrastructure = async () => {
  await Processes.changeDir(PULLY_DEPLOY_DIRECTORY);
  updateSpinnerText("Bootstraping AWS CDK... This may take a while.");
  await Processes.spawn("cdk", ["bootstrap"]);
  spinnerSuccess("CDK bootstraped successfully");
  updateSpinnerText(
    "Deploying Infrastructure... This may take about 15 minutes or more."
  );
  await Processes.run(`chmod +x ${PULLY_DEPLOY_DIRECTORY}/lib/index.js`);
  await Processes.run(
    "cdk deploy '*' --outputs-file cdk_outputs.json --require-approval never"
  );
  spinnerSuccess("Infrastructure has been deployed to AWS successfully");
};

const printImportantInformation = async () => {
  // Print info from cdk json
  const pathToDeploy = path.resolve(
    `${PULLY_DEPLOY_DIRECTORY}/cdk_outputs.json`
  );

  const fileContents = await FileUtils.getFileContents(pathToDeploy);
  const parsedFileContents = JSON.parse(fileContents);
  console.log(parsedFileContents);
};

const askForInitialCredentials = async () => {
  const awsCredentials = await askQuestion([
    deployNewInfraQuestions.ACCESS_KEY,
    deployNewInfraQuestions.SECRET_KEY,
    deployNewInfraQuestions.SESSION_KEY,
    deployNewInfraQuestions.REGION,
  ]);

  await saveCredentials(awsCredentials);
};

const init = async () => {
  try {
    const deployNew = await askQuestion([deployNewInfraQuestions.DEPLOY_NEW]);

    if (deployNew.proceed === "yes") {
      await createGlobalDirectory();

      if (await FileUtils.fileOrfolderExistsSync(PULLY_ENVIRONMENT_PATH)) {
        const deployUpdate = await askQuestion([
          deployNewInfraQuestions.DEPLOY_UPDATE,
        ]);

        if (deployUpdate.proceed === "yes") {
          await askForInitialCredentials();
        } else {
          let accessKey = process.env.ACCESS_KEY;
          let secretKey = process.env.SECRET_KEY;
          let sessionKey = process.env.SESSION_KEY;
          let region = process.env.REGION;

          // Check if access key is available. If not prompt user.
          if (!accessKey) {
            const response = await askQuestion([
              {
                ...deployNewInfraQuestions.ACCESS_KEY,
                message: `Access Key not found. ${deployNewInfraQuestions.ACCESS_KEY.message}`,
              },
            ]);

            accessKey = response.access_key;
          }

          // Check if secret key is available. If not prompt user.
          if (!secretKey) {
            const response = await askQuestion([
              {
                ...deployNewInfraQuestions.SECRET_KEY,
                message: `Secret Key not found. ${deployNewInfraQuestions.SECRET_KEY.message}`,
              },
            ]);

            secretKey = response.secret_key;
          }

          // Check if session key is available. If not prompt user.
          if (!sessionKey) {
            const response = await askQuestion([
              {
                ...deployNewInfraQuestions.SESSION_KEY,
                message: `Session Token not found. ${deployNewInfraQuestions.SESSION_KEY.message}`,
              },
            ]);

            sessionKey = response.session_key;
          }

          // Check if region is available. If not prompt user.
          if (!region) {
            const response = await askQuestion([
              {
                ...deployNewInfraQuestions.REGION,
                message: `Region not found. ${deployNewInfraQuestions.REGION.message}`,
              },
            ]);

            accessKey = response.region;
          }
        }
      } else {
        await askForInitialCredentials();
      }

      // clone deploy directory
      // run npm install
      // do a global install of aws cdk
      // run the cdk deploy
      // read the cdk outputs file and print relevant information to the terminal
      await cloneDeploymentRepo();
      await runInstalls();
      await deployInfrastructure();
      await printImportantInformation();
      await createPullyClientDirectories();
      console.log("Your pully infrastructure has been deployed.");
    } else {
      const deployUpdate = await askQuestion([
        deployNewInfraQuestions.DEPLOY_UPDATE,
      ]);

      if (deployUpdate.proceed === "yes") {
        await askForInitialCredentials();
      }

      await createPullyClientDirectories();
    }
  } catch (err) {
    console.log(err);
    spinnerError(err?.message);
  }
};

module.exports = init;
