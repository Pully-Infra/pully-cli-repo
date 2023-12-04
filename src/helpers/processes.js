const { exec, spawn } = require("child_process");
const { chdir } = require("process");

class Processes {
  static changeDir = (dir) => {
    return new Promise((resolve) => {
      chdir(dir);
      resolve();
    });
  };

  static run = (command) => {
    return new Promise((resolve, reject) => {
      exec(command, (err) => {
        if (err) {
          reject(err);
          return;
        }

        resolve();
      });
    });
  };

  static spawn = (command, args = []) => {
    return new Promise((resolve) => {
      const spawnedProcess = spawn(command, args);

      spawnedProcess.on("close", () => {
        resolve();
      });

      spawnedProcess.on("exit", () => {
        resolve();
      });
    });
  };
}

module.exports = Processes;
