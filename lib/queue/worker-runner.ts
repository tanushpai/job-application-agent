import { startApplicationWorker } from "./worker";

async function main() {
  console.log("[WorkerRunner] Starting standalone Background Application Worker...");
  try {
    await startApplicationWorker();
    console.log("[WorkerRunner] Worker is actively listening for application jobs.");
  } catch (err) {
    console.error("[WorkerRunner] Failed to initialize worker runner:", err);
    process.exit(1);
  }
}

main();
