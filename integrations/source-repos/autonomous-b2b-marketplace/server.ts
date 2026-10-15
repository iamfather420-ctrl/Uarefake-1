import { app, startServer } from "./artifacts/api-server/src/index.ts";

// Unified Workspace Common Entry Point
export { app, startServer };

startServer().catch((err) => {
  console.error("Failed to boot common server entry:", err);
  process.exit(1);
});

process.on("SIGINT", () => {
  console.log("Shutting down common server entry...");
  process.exit(0);
});

process.on("SIGTERM", () => {
  console.log("Terminating common server entry...");
  process.exit(0);
});

