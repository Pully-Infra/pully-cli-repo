const FileUtils = require("./fileUtils");
const { prompt } = require("inquirer");
const { homedir } = require("os");

const {
  fileOrfolderExistsSync,
  createMultipleFolders,
  removeFolderAndContents,
} = FileUtils;

const cwd = process.cwd;

const Proceed = {
  yes: "yes",
  no: "no",
};

const PULLY_TEST_FOLDER = "hello";
const PULLY_FUNCTIONS = `${cwd}/pully_functions`;
const PULLY_BUILD_FOLDER = `${cwd}/pully_build`;
const ZIPPED_PULLY_FUNCTIONS = `${PULLY_BUILD_FOLDER}/zipped_pully_functions`;
const UNZIPPED_PULLY_FUNCTIONS = (num, fnName) =>
  `${PULLY_BUILD_FOLDER}/unzipped_pully_functions_${num}/${fnName}`;

const ERROR_CODES = {
  FOLDER: {
    "001": "",
  },
};

const initFunction = `/* 
    N.B: Please make sure that the handler function always has the async keyword.

    Information about the message argument:
    - type => object
    - properties => type: "MessageEvent"
                    payload: <Message you sent to the channel your function is registered to>
*/

const handler = async (message) => {
    return message;
};
`;

const initRelationshipJson = `{
    "channels": {}
}`;

const ACTIONS = {
  CREATE: "Create",
  UPDATE: "Update",
  NO_CHANGE: "No Change",
};

const createZippedFunctionsFolder = async () => {
  const folderPresent = await fileOrfolderExistsSync(ZIPPED_PULLY_FUNCTIONS);
  !folderPresent && (await createMultipleFolders(ZIPPED_PULLY_FUNCTIONS));
};

const removeZippedFunctionsFolder = async () => {
  const folderPresent = await fileOrfolderExistsSync(ZIPPED_PULLY_FUNCTIONS);
  folderPresent && (await removeFolderAndContents(ZIPPED_PULLY_FUNCTIONS));
};

const removeDistFunctionsFolder = async (fileName, fullPath = null) => {
  const distFolder = fullPath
    ? fullPath
    : `${PULLY_FUNCTIONS}/${fileName}/dist`;
  const folderPresent = await fileOrfolderExistsSync(distFolder);
  folderPresent && (await removeFolderAndContents(distFolder));
};

const askQuestion = async (questions) => {
  const response = await prompt(questions);
  return response;
};

const deployNewInfraQuestions = {
  DEPLOY_NEW: {
    type: "list",
    name: "proceed",
    default: Proceed.yes,
    choices: [Proceed.yes, Proceed.no],
    message: "Do you want to deploy a new pully infrastructure? (yes/no)",
  },
  DEPLOY_UPDATE: {
    type: "list",
    name: "proceed",
    default: Proceed.yes,
    choices: [Proceed.yes, Proceed.no],
    message: "Do you want to update your aws credentials? (yes/no)",
  },
  ACCESS_KEY: {
    type: "password",
    name: "access_key",
    mask: "*",
    message: "Please enter your AWS Access Key ID:",
  },
  SESSION_KEY: {
    type: "password",
    name: "session_key",
    mask: "*",
    message: "Please enter your Session Token:",
  },
  SECRET_KEY: {
    type: "password",
    name: "secret_key",
    mask: "*",
    message: "Please enter your AWS Secret Key ID:",
  },
  REGION: {
    type: "input",
    name: "region",
    message: "Please enter your AWS Region:",
  },
};

const PULLY_GLOBAL_DIRECTORY = `${homedir()}/.pully`;
const PULLY_DEPLOY_DIRECTORY = `${PULLY_GLOBAL_DIRECTORY}/deploy`;
const PULLY_ENVIRONMENT_PATH = `${PULLY_GLOBAL_DIRECTORY}/.env`;
const TEST_REPO_NAME =
  "https://thatjsprof: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@github.com/Pully-Infra/pully-deploy.git";
const REPO_NAME = "https://github.com/Pully-Infra/pully-deploy.git";

module.exports = {
  Proceed,
  PULLY_TEST_FOLDER,
  PULLY_FUNCTIONS,
  PULLY_BUILD_FOLDER,
  ZIPPED_PULLY_FUNCTIONS,
  UNZIPPED_PULLY_FUNCTIONS,
  ERROR_CODES,
  initFunction,
  initRelationshipJson,
  ACTIONS,
  createZippedFunctionsFolder,
  removeZippedFunctionsFolder,
  removeDistFunctionsFolder,
  askQuestion,
  deployNewInfraQuestions,
  PULLY_GLOBAL_DIRECTORY,
  PULLY_DEPLOY_DIRECTORY,
  PULLY_ENVIRONMENT_PATH,
  TEST_REPO_NAME,
  REPO_NAME,
};
