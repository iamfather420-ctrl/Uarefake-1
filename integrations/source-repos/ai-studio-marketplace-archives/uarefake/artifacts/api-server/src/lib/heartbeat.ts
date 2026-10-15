import { logger } from "./logger";
import { getTelemetry, setSystemStatic } from "./telemetry";

const LATENCY_THRESHOLD_MS = 5000;
const RECOVERY_THRESHOLD_MS = 2500;
const REQUIRED_CONSECUTIVE_VIOLATIONS = 5;

export const startHeartbeat = (): void => {
  logger.info("SOLVEX-CORE-02: Heartbeat watchdog initialized across 54-node pipeline");

  const startTime = Date.now();
  let consecutiveViolations = 0;
  let consecutiveRecoveries = 0;

  setInterval(() => {
    const t = getTelemetry();
    const lag = parseFloat(t.eventLoopLagMs);

    // Skip checks during a 15-second startup warm-up period
    if (Date.now() - startTime < 15000) {
      return;
    }

    if (lag > LATENCY_THRESHOLD_MS) {
      consecutiveViolations++;
      consecutiveRecoveries = 0;

      if (consecutiveViolations >= REQUIRED_CONSECUTIVE_VIOLATIONS && !t.systemStatic) {
        setSystemStatic(true);
        logger.error(
          { lag, threshold: LATENCY_THRESHOLD_MS, heapUsedMB: t.heapUsedMB, consecutiveViolations },
          "SOLVEX-CORE-02 [CRITICAL] Latency threshold exceeded — System-Static mode engaged",
        );
      }
    } else {
      consecutiveViolations = 0;
      
      if (lag < RECOVERY_THRESHOLD_MS) {
        consecutiveRecoveries++;
        if (consecutiveRecoveries >= 3 && t.systemStatic) {
          setSystemStatic(false);
          logger.info(
            { lag },
            "SOLVEX-CORE-02 [RECOVERY] Lag normalized — exiting System-Static mode, L7 Autonomic Healing validated",
          );
        }
      } else {
        consecutiveRecoveries = 0;
      }
    }
  }, 1000);
};
