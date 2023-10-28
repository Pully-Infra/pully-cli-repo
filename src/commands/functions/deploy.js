const ora = require("ora");
const path = require("path");
const AdmZip = require("adm-zip");
const inquirer = require("inquirer");
const { lstatSync, createReadStream } = require("node:fs");

const { s3Service } = require("../../services");
const FileUtils = require("../../utils/fileUtils");
const { lambdaManager } = require("../../managers");
const { Proceed } = require("../../interfaces/general");
const {
  ACTIONS,
  PULLY_FUNCTIONS,
  ZIPPED_PULLY_FUNCTIONS,
  createZippedFunctionsFolder,
  removeDistFunctionsFolder,
  removeZippedFunctionsFolder,
} = require("src/utils/constants");
const generateTableWithInfo = require("src/helpers/generateTableWithInfo");

const { getFolderContents } = FileUtils;

const spinner = ora("Deploying Function(s) ...");

const deployFnc = async () => {
  try {
    const folders = await getFolderContents(PULLY_FUNCTIONS, (content) =>
      content.isDirectory()
    );

    if (folders.length > 0) {
      const { table, changesMap } = await generateTableWithInfo();

      console.log(table.toString()); // Table of functions and changes

      // Filter functions that have changes or newly created here
      const foldersToUpdate = folders.filter((folder) => {
        const folderChangeStatus = changesMap.get(folder.name);

        if (folderChangeStatus === ACTIONS.NO_CHANGE) return false;
        return true;
      });

      if (foldersToUpdate.length === 0) {
        console.log("No changes to deploy");

        for (let i = 0; i < folders.length; i++) {
          const folder = folders[i];
          await removeDistFunctionsFolder(folder.name);
        }

        await removeZippedFunctionsFolder();
        process.exit(0);
      }

      inquirer
        .prompt([
          {
            type: "list",
            name: "proceed",
            default: Proceed.yes,
            choices: [Proceed.yes, Proceed.no],
            message: "Do you want to proceed? (yes)",
          },
        ])
        .then(async (answers) => {
          if (answers.proceed === Proceed.yes) {
            // Create zipped functions folder
            await createZippedFunctionsFolder();

            // Map over functions to update
            for (let i = 0; i < foldersToUpdate.length; i++) {
              const folder = foldersToUpdate[i];

              const sourceDir = `${PULLY_FUNCTIONS}/${folder.name}/dist`;

              const zip = new AdmZip();

              const folderContents = await getFolderContents(sourceDir);

              folderContents.forEach((file) => {
                const filePath = `${sourceDir}/${file.name}`;

                if (lstatSync(filePath).isDirectory()) {
                  zip.addLocalFolder(filePath);
                } else {
                  zip.addLocalFile(filePath);
                }
              });

              const filePath = `${ZIPPED_PULLY_FUNCTIONS}/${folder.name}.zip`;

              zip.writeZip(filePath);
            }

            const contents = await getFolderContents(ZIPPED_PULLY_FUNCTIONS);

            const uploadedFiles = await Promise.all(
              contents.map(async ({ name }) => {
                const fileName = name.split(".")?.[0];

                const filePath = path.join(ZIPPED_PULLY_FUNCTIONS, name);
                const fileStream = createReadStream(filePath);

                const uploadResponse = await s3Service.upload(
                  [
                    {
                      body: fileStream,
                      fileName: `functions/${name}`,
                      contentType: "application/zip",
                    },
                  ],
                  false
                );

                if (uploadResponse.length > 0) {
                  await removeDistFunctionsFolder(fileName);
                }

                return uploadResponse.map((res) => {
                  return {
                    ...res,
                    functionName: fileName,
                  };
                });
              })
            );

            const toUpload = uploadedFiles.flat(1);

            if (toUpload.length > 0) {
              await removeZippedFunctionsFolder();

              spinner.start();
              await lambdaManager.handleUpdate(toUpload);
              spinner.stop();

              console.log("Change(s) deployed successfully");
            }
          } else {
            for (let i = 0; i < folders.length; i++) {
              const folder = folders[i];
              await removeDistFunctionsFolder(folder.name);
            }

            await removeZippedFunctionsFolder();
          }

          process.exit(0);
        });
    } else {
      console.log("No functions to deploy");
    }
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
};

module.exports = deployFnc;
