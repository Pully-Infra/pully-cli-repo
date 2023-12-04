const esbuild = require("esbuild");

const bundleWithEsbuild = async (entryPoints, sourceDir) => {
  await esbuild.build({
    entryPoints,
    bundle: true,
    format: "cjs",
    platform: "node",
    write: true,
    outdir: sourceDir,
    allowOverwrite: true,
    external: ["esbuild", "node_modules"],
  });
};

module.exports = bundleWithEsbuild;
