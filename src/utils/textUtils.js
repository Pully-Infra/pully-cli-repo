const { v4: uuid } = require("uuid");

class TextUtils {
  static appendUniqieIdentifier = (str) => {
    const uniqueIdentifier = uuid();
    const splitString = str.split(".");
    const extension = splitString.pop();
    const newString = `${splitString.join(
      ""
    )}/${uniqueIdentifier}.${extension}`;
    return newString;
  };
}

module.exports = TextUtils;
