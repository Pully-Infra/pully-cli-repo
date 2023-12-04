const Table = require("cli-table");
const { createWriteStream } = require("fs");

const {
  ACTIONS,
  PULLY_FUNCTIONS,
  ZIPPED_PULLY_FUNCTIONS,
  createZippedFunctionsFolder,
  removeZippedFunctionsFolder,
} = require("../utils/constants");
const { s3Service } = require("../services");
const FileUtils = require("../utils/fileUtils");
const compareZipContents = require("./checkForChanges");
const bundleWithEsBuild = require("../config/esbuild");

const { writeFile, getFolderContents } = FileUtils;

const generateTableWithInfo = async (tableHeader = ["Function", "Status"]) => {
  const changesMap = new Map();

  const folders = await getFolderContents(PULLY_FUNCTIONS, (content) =>
    content.isDirectory()
  );

  const table = new Table({
    head: tableHeader,
    colWidths: [30, 20],
  });

  // Check for function changes here
  for (let i = 0; i < folders.length; i++) {
    const folder = folders[i];

    const file = await s3Service.getFile(
      {
        key: `functions/${folder.name}.zip`,
      },
      null
    );

    await removeZippedFunctionsFolder();
    await createZippedFunctionsFolder();

    const sourceDir = `${PULLY_FUNCTIONS}/${folder.name}/dist`;

    await bundleWithEsBuild(
      [
        `${PULLY_FUNCTIONS}/${folder.name}/**/*.js`,
        `${PULLY_FUNCTIONS}/${folder.name}/**/*.ts`,
      ],
      sourceDir
    );

    if (file) {
      const writtenFile = `${ZIPPED_PULLY_FUNCTIONS}/${folder.name}.zip`;
      const fileStream = createWriteStream(writtenFile);

      if (typeof file === "string") await writeFile(writtenFile, file);
      else {
        file.pipe(fileStream);

        const saveStream = async () => {
          try {
            return new Promise((resolve, reject) => {
              fileStream.on("finish", () => {
                resolve(`File saved successfully at ${writtenFile}`);
              });

              fileStream.on("error", () => {
                reject(null);
              });
            });
          } catch (error) {
            console.error(error);
            return null;
          }
        };

        await saveStream();
      }

      const s3Path = writtenFile;

      const changes = await compareZipContents(
        { path: sourceDir, zip: false, rm: false },
        { path: s3Path },
        folder.name
      );

      if (changes) {
        changesMap.set(folder.name, ACTIONS.UPDATE);
      } else {
        changesMap.set(folder.name, ACTIONS.NO_CHANGE);
      }
    } else {
      changesMap.set(folder.name, ACTIONS.CREATE);
    }

    const status = changesMap.get(folder.name);

    table.push([folder.name, status]);
  }

  return {
    table,
    changesMap,
  };
};

module.exports = generateTableWithInfo;
