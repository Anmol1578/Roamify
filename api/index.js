const path = require("path");
const { createRequestHandler } = require("@expo/server/adapter/vercel");

const serverBuildPath = process.env.VERCEL
  ? path.join(process.cwd(), "dist/server")
  : path.resolve(__dirname, "../dist/server");

const handleExpo = createRequestHandler({
  build: serverBuildPath,
});

module.exports = async (req, res) => {
  // If someone visits root in a browser, return a friendly JSON health status instead of trying to SSR mobile UI
  if (req.url === "/" || req.url === "") {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok", service: "Roamify API Backend" }));
  }
  return handleExpo(req, res);
};
