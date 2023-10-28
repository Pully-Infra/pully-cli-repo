const { lambdaService } = require("../services");

class LambdaManager {
  async handleUpdate(functions = []) {
    await Promise.all(
      functions.map(async ({ functionName, fileName }) => {
        const functionExists = await lambdaService.functionExists(functionName);

        if (functionExists) {
          await lambdaService.update(fileName, functionName);
        } else {
          await lambdaService.create({
            s3Key: fileName,
            functionName: functionName,
          });
        }
      })
    );
  }

  async handleDelete(functionName) {
    const functionExists = await lambdaService.functionExists(functionName);

    if (functionExists) {
      await lambdaService.delete(functionName);
    }
  }
}

module.exports = LambdaManager;
