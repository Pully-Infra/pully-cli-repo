const ora = require("ora");

const spinner = ora();

const updateSpinnerText = (message) => {
  if (spinner.isSpinning) {
    spinner.text = message;
    return;
  }
  spinner.start(message);
};

const stopSpinner = () => {
  if (spinner.isSpinning) {
    spinner.stop();
  }
};

const spinnerError = (message) => {
  if (spinner.isSpinning) {
    spinner.fail(message);
  }
};

const spinnerSuccess = (message) => {
  if (spinner.isSpinning) {
    spinner.succeed(message);
  }
};

const spinnerInfo = (message) => {
  spinner.info(message);
};

module.exports = {
  updateSpinnerText,
  stopSpinner,
  spinnerError,
  spinnerSuccess,
  spinnerInfo,
};
