const { PULLY_ENVIRONMENT_PATH } = require("../utils/constants");
const dotenv = require("dotenv");
dotenv.config({ path: PULLY_ENVIRONMENT_PATH });

const CONFIG = {
  REGION: process.env.REGION || "us-east-1",
  LAMBDA_ROLE: process.env.LAMBDA_ROLE,
  ACCESS_KEY: process.env.ACCESS_KEY,
  SECRET_KEY: process.env.SECRET,
  BUCKET_NAME: process.env.AWS_BUCKET_NAME || "pully-general-bucket",
};

const GENERAL_CONFIG = {
  region: CONFIG.REGION,
  credentials: {
    accessKeyId: CONFIG.ACCESS_KEY,
    secretAccessKey: CONFIG.SECRET_KEY,
  },
};

module.exports = {
  CONFIG,
  GENERAL_CONFIG,
};
