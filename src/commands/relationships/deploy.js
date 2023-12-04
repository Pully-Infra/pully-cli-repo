const ora = require("ora");
const path = require("path");
const axios = require("axios");
const dotenv = require("dotenv");
const FileUtils = require("../../utils/fileUtils");
const { PULLY_ENVIRONMENT_PATH } = require("../../utils/constants");
dotenv.config({ path: PULLY_ENVIRONMENT_PATH });

const spinner = ora("Deploying relationships file");

const endpoint =
  process.env.SERVER_URL || "http://127.0.0.1:3008/relationships";

const deployFnc = async () => {
  try {
    spinner.start();

    const fileContents = await FileUtils.getFileContents(
      path.resolve("relationships.json")
    );

    const stringifiedRelationship = JSON.stringify(JSON.parse(fileContents));

    const response = await axios.post(endpoint, {
      relationshipString: stringifiedRelationship,
    });

    const message = response.data?.message;
    spinner.succeed();
    console.log(message);
  } catch (err) {
    spinner.stop();

    const errorsArray = err?.response?.data?.errors || [];

    errorsArray
      .map((error) => error?.message)
      .forEach((error) => {
        console.log(error);
      });

    errorsArray.length === 0 && console.log(err);
    process.exit(1);
  }
};

module.exports = deployFnc;
