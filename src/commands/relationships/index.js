const deployFnc = require("./deploy");

const { Command } = require("commander");

const relationships = new Command("relationships").description(
  "Manage relationship between pully functions and message channels"
);

relationships
  .command("deploy")
  .description("Deploy updated relationships file")
  .action(deployFnc);

module.exports = relationships;
