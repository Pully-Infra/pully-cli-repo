const fs = require("fs");
const path = require("path");
const crypto = require("crypto");
const AdmZip = require("adm-zip");
const FileUtils = require("../utils/fileUtils");
const { UNZIPPED_PULLY_FUNCTIONS } = require("../utils/constants");

// const contentToRemove = [".DS_Store", "__MACOSX"];

/*
    This function gets the files and folders in a directory
*/

function getFilesAndFolders(directoryPath, parentPath = "") {
  const items = fs.readdirSync(directoryPath);
  let result = [];

  items.forEach((item) => {
    const itemPath = path.join(directoryPath, item);

    if (fs.statSync(itemPath).isDirectory()) {
      result = result.concat(
        getFilesAndFolders(itemPath, path.join(parentPath, item))
      );
    } else {
      result.push(path.join(parentPath, item));
    }
  });

  return result;
}

/*
    This function reads the file at the filePath passed to it and creates a hash of the content
*/

const getHash = (filePath) => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash("sha256");
    const stream = fs.createReadStream(filePath);
    stream.on("data", (data) => hash.update(data, "utf8"));
    stream.on("end", () => resolve(hash.digest("hex")));
    stream.on("error", (error) => reject(error));
  });
};

/*
    This function maps over an array of files and sets the hash of each file to a map
*/

const generateHashes = async (files = [], pathToCompare) => {
  const contents = new Map();

  for (const file of files) {
    const filePath = path.join(pathToCompare, file);

    const hash = await getHash(filePath);
    contents.set(file, hash);
  }

  return contents;
};

/*
    This function extracts the files in a zipped content to a specified directory
*/

const extractZipContent = async (isZip, zipPath, localPath) => {
  const resolvedLocalPath = path.resolve(localPath);
  const zipExtractedDir = isZip
    ? (async () => {
        const folderPresent = await FileUtils.fileOrfolderExistsSync(
          resolvedLocalPath
        );

        !folderPresent &&
          (await FileUtils.createMultipleFolders(resolvedLocalPath));
        return resolvedLocalPath;
      })()
    : zipPath;

  const extracted = await zipExtractedDir;

  if (isZip) {
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extracted, true);
  }

  return extracted;
};

/*
    This function compares the contents of two zipped files
*/

const compareZipContents = async (
  { path: zip1Url, zip: is1Zip = true, rm: rm1 = true },
  { path: zip2Url, zip: is2Zip = true, rm: rm2 = true },
  fnName
) => {
  const zip1Path = path.resolve(zip1Url);
  const zip2Path = path.resolve(zip2Url);

  const compareFolders = async (folder1, folder2) => {
    const files1 = getFilesAndFolders(folder1);
    const files2 = getFilesAndFolders(folder2);

    const contents1 = await generateHashes(files1, folder1);
    const contents2 = await generateHashes(files2, folder2);

    let change = false;

    // Compare contents and check for differences
    contents1.forEach(async (hash1, file) => {
      const hash2 = contents2.get(file);

      if (hash2 && hash1 !== hash2) {
        change = true;
        // console.log(`Difference found in ${path.join(folder1, file)}`);
      }
    });

    return change;
  };

  const extracted1 = await extractZipContent(
    is1Zip,
    zip1Path,
    UNZIPPED_PULLY_FUNCTIONS(1, fnName)
  );

  const extracted2 = await extractZipContent(
    is2Zip,
    zip2Path,
    UNZIPPED_PULLY_FUNCTIONS(2, fnName)
  );

  const result = await compareFolders(extracted1, extracted2);

  // Clean up temporary directories
  rm1 && FileUtils.removeFolderAndContents(extracted1);
  rm2 && FileUtils.removeFolderAndContents(extracted2);

  return result;
};

module.exports = compareZipContents;
