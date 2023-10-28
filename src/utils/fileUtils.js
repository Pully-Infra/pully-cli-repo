const { existsSync, constants, readFileSync } = require("node:fs");
const { mkdir, writeFile, access, readdir, rm } = require("node:fs/promises");

class FileUtils {
  static async createMultipleFolders(folderName) {
    await mkdir(folderName, { recursive: true });
  }

  static async createFolder(folderName) {
    await mkdir(folderName);
  }

  static async writeFile(path, content) {
    await writeFile(path, content);
  }

  static async removeFolderAndContents(path) {
    await rm(path, { recursive: true });
  }

  static async folderExists(path) {
    return access(path, constants.F_OK | constants.R_OK);
  }

  static async fileOrfolderExistsSync(path) {
    return existsSync(path);
  }

  static async getFolderContents(path, callback) {
    const contents = await readdir(path, { withFileTypes: true });
    return callback ? contents.filter(callback) : contents;
  }

  static async getFileContents(path, type = "utf8") {
    const contents = readFileSync(path, { encoding: type });
    return contents;
  }
}

module.exports = FileUtils;
