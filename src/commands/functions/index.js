const addFnc = require("./add");
const deleteFnc = require("./delete");
const deployFnc = require("./deploy");

const { Command } = require("commander");
const statusFnc = require("./status");

export const functions = new Command("function").description(
  "Manage pully functions"
);

functions
  .command("add")
  .description("Create a new pully function")
  .argument("<name>", "The name of the function to add")
  .action(addFnc);

functions
  .command("status")
  .description("Check the status of your functions")
  .action(statusFnc);

functions
  .command("delete")
  .description("Delete new pully function")
  .argument("<name>", "The name of the function to delete")
  .action(deleteFnc);

functions
  .command("deploy")
  .description("Deploy changes to pully functions")
  .action(deployFnc);
