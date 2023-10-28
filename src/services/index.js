const IamService = require("./iam");
const LambdaService = require("./lambda");
const S3Service = require("./s3");

const s3Service = new S3Service();
const iamService = new IamService();
const lambdaService = new LambdaService();

module.exports = { s3Service, iamService, lambdaService };
