const ora = require("ora");
const path = require("path");

const {
  PULLY_FUNCTIONS,
  PULLY_BUILD_FOLDER,
  removeDistFunctionsFolder,
} = require("../../utils/constants");
const FileUtils = require("../../utils/fileUtils");
const generateTableWithInfo = require("../../helpers/generateTableWithInfo");

const { getFolderContents, fileOrfolderExistsSync, removeFolderAndContents } =
  FileUtils;

const spinner = ora("Fetching function(s) status...");

const statusFnc = async () => {
  try {
    const folders = await getFolderContents(PULLY_FUNCTIONS, (content) =>
      content.isDirectory()
    );

    if (folders.length > 0) {
      spinner.start();

      const { table } = await generateTableWithInfo();

      const pathToFolder = path.resolve(PULLY_BUILD_FOLDER);
      const folderPresent = await fileOrfolderExistsSync(pathToFolder);
      folderPresent && (await removeFolderAndContents(pathToFolder));

      for (let i = 0; i < folders.length; i++) {
        const folder = folders[i];
        await removeDistFunctionsFolder(folder.name);
      }

      spinner.stop();
      console.log(table.toString()); // Table of functions and changes
    } else {
      console.log("No functions found");
    }
  } catch (err) {
    console.log(err?.message || err);
    process.exit(1);
  }
};

module.exports = statusFnc;
