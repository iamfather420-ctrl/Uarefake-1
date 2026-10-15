import { describe, it, expect, vi, beforeEach } from "vitest";
import { executeSecure, getSidecarStatus } from "../lib/vault";

vi.mock("./logger", () => {
  return {
    logger: {
      info: vi.fn(),
      warn: vi.fn(),
      error: vi.fn(),
    },
  };
});

describe("Keyless Vault Sidecar Integration", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it("should report initial status as STARTING", () => {
    expect(getSidecarStatus()).toBe("STARTING");
  });

  it("should fall back to ephemeral local signing if sidecar is unavailable", async () => {
    const action = "TRANSFER_FUNDS";
    const data = { recipient: "0x123", amount: "5.4" };

    const result = await executeSecure(action, data);

    // Should gracefully complete (fallback) even with no active sidecar process
    expect(result.ok).toBe(false);
    expect(result.action).toBe(action);
    expect(result.signature).toBeDefined();
    expect(result.digest).toBeDefined();
    expect(result.nonce).toBeDefined();
    expect(result.timestamp).toBeDefined();
  });
});
