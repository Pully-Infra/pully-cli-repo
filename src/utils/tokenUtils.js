const jwt = require("jsonwebtoken");
const { CONFIG } = require("../config/config");

const JWT_SECRET = CONFIG.SECRET_KEY;

class TokenUtils {
  static createToken = (payload, expiresIn = 86400) => {
    return jwt.sign(payload, `${JWT_SECRET}`, {
      expiresIn,
    });
  };

  static verifyToken = (token) => {
    return jwt.verify(token, `${JWT_SECRET}`);
  };
}

module.exports = TokenUtils;
