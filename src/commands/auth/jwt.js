const { PULLY_ENVIRONMENT_PATH } = require("../../utils/constants");
const TokenUtils = require("../../utils/tokenUtils");
const dotenv = require("dotenv");
dotenv.config({ path: PULLY_ENVIRONMENT_PATH });

const secret = process.env.SECRET;

// Validate .env exists with the right credentials
// persist tokens to s3 and find a way to revoke access

const jwtFn = () => {
  try {
    const newClientToken = TokenUtils.createToken({ secret });
    console.log(`JWT Client Token: ${newClientToken}`);
  } catch (err) {
    console.log(err?.message || err);
    process.exit(1);
  }
};

module.exports = jwtFn;
