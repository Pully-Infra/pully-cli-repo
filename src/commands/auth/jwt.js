const TokenUtils = require("../../utils/tokenUtils");
const { v4: uuid } = require("uuid");

const payload = uuid();

const jwtFn = () => {
  const newClientToken = TokenUtils.createToken(payload);
  console.log(newClientToken);
};

module.exports = jwtFn;
