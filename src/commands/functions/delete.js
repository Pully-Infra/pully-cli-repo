const path = require("path");
const ora = require("ora");

const { s3Service } = require("../../services");
const { CONFIG } = require("../../config/config");
const FileUtils = require("../../utils/fileUtils");
const { lambdaManager } = require("../../managers");
const { PULLY_FUNCTIONS } = require("../../utils/constants");

const { fileOrfolderExistsSync, removeFolderAndContents } = FileUtils;

const spinner = ora("Deleting Function(s) ...");

const deleteFnc = async (functionName) => {
  try {
    const functionPath = path.resolve(`${PULLY_FUNCTIONS}/${functionName}`);
    const folderPresent = await fileOrfolderExistsSync(functionPath);

    if (folderPresent) {
      spinner.start();

      // Delete from lambda
      await lambdaManager.handleDelete(functionName);

      // Delete from S3
      await s3Service.deleteFile({
        bucketName: CONFIG.BUCKET_NAME,
        key: `functions/${functionName}.zip`,
      });

      // Delete locally
      await removeFolderAndContents(functionPath);

      spinner.stop();
    } else {
      console.log(`Function ${functionName} does not exist`);
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = deleteFnc;
