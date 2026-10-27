const path = require("path");
const { createRequestHandler } = require("@expo/server/adapter/vercel");

const serverBuildPath = process.env.VERCEL
  ? path.join(process.cwd(), "dist/server")
  : path.resolve(__dirname, "../dist/server");

const handleExpo = createRequestHandler({
  build: serverBuildPath,
});

module.exports = async (req, res) => {
  // If accessing root in a browser (which Vercel rewrites to /api/index), return health status
  const isSpecificApi = req.url.includes("/api/ask") || req.url.includes("/api/search");
  if (!isSpecificApi) {
    res.writeHead(200, { "Content-Type": "application/json" });
    return res.end(JSON.stringify({ status: "ok", service: "Roamify API Backend" }));
  }
  return handleExpo(req, res);
};
