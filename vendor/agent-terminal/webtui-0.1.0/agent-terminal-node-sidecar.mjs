// Stub: agent-terminal-node-sidecar.mjs
// This is a minimal Node.js sidecar stub for the agent terminal runtime.
// In a real deployment, this would be replaced with the actual webtui sidecar.

import { spawn } from "node:child_process";
import { createServer } from "node:http";

const server = createServer((req, res) => {
  res.writeHead(200, { "Content-Type": "text/plain" });
  res.end("Agent terminal sidecar stub");
});

server.listen(0, () => {
  const port = server.address().port;
  console.log(`Agent terminal sidecar stub listening on port ${port}`);
});

process.on("SIGINT", () => {
  server.close();
  process.exit(0);
});
