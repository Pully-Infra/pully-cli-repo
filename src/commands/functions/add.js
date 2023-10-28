const ora = require("ora");

const FileUtils = require("../../utils/fileUtils");
const { lambdaService } = require("../..services");
const { PULLY_FUNCTIONS, initFunction } = require("../../utils/constants");

const { fileOrfolderExistsSync, writeFile, createFolder, getFolderContents } =
  FileUtils;

const validateName = (name) => {
  let error = null;
  const isValidName = /^[a-zA-Z0-9]+$/;

  if (!name || name.length < 3) {
    error = "Invalid function name: Name must be at least 3 characters long.";
  } else if (!isValidName.test(name)) {
    error =
      "Invalid function name: Name cannot contain spaces or special characters.";
  }

  return error;
};

const spinner = ora("Adding Function(s) ...");

const addFnc = async (functionName) => {
  const validated = validateName(functionName);

  if (validated) {
    console.error(validated);
    process.exit(1);
  }

  try {
    const folderContents = await getFolderContents(PULLY_FUNCTIONS, (content) =>
      content.isDirectory()
    );
    const folders = folderContents.map((folder) => folder.name);
    const folderExists = folders.includes(functionName);

    const lambdaExistsAction = () => {
      console.log(
        `A function with the name '${functionName}' exists or has already been deployed. Please choose another name.`
      );
      process.exit(1);
    };

    if (folderExists) {
      lambdaExistsAction();
    }

    const lambdaExists = await lambdaService.functionExists(functionName);

    if (lambdaExists) {
      lambdaExistsAction();
    }

    spinner.start();

    const functionPath = `${PULLY_FUNCTIONS}/${functionName}`;

    const folderPresent = await fileOrfolderExistsSync(functionPath);

    if (folderPresent) {
      console.error("A function with that name already exists");
      spinner.stop();
      return;
    }

    await createFolder(functionPath);
    await writeFile(`${functionPath}/index.js`, initFunction);

    spinner.stop();
  } catch (err) {
    console.log(err?.message || err);
    process.exit(1);
  }
};

module.exports = addFnc;
