const path = require("path");
const { createRequestHandler } = require("@expo/server/adapter/vercel");

const serverBuildPath = process.env.VERCEL
  ? path.join(process.cwd(), "dist/server")
  : path.resolve(__dirname, "../dist/server");

module.exports = createRequestHandler({
  build: serverBuildPath,
});
