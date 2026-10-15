import { describe, it, expect, vi, beforeEach } from "vitest";
import { l5ConsensusGate } from "../lib/consensus";
import * as workers from "../lib/workers";

vi.mock("../lib/workers", () => {
  return {
    getLastConsensus: vi.fn(),
    isSystemIsolated: vi.fn(),
  };
});

vi.mock("@workspace/db", () => {
  return {
    db: {
      insert: vi.fn().mockReturnValue({
        values: vi.fn().mockResolvedValue({}),
      }),
    },
    auditLogTable: {},
  };
});

describe("Consensus Grid Gate", () => {
  let mockReq: any;
  let mockRes: any;
  let mockNext: any;

  beforeEach(() => {
    vi.resetAllMocks();
    mockReq = {
      method: "POST",
      path: "/api/test",
    };
    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };
    mockNext = vi.fn();
  });

  it("should bypass consensus gate for GET requests", async () => {
    mockReq.method = "GET";
    await l5ConsensusGate(mockReq, mockRes, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it("should block with 503 if system is isolated", async () => {
    vi.mocked(workers.isSystemIsolated).mockReturnValue(true);

    await l5ConsensusGate(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "SYSTEM_STATIC",
        code: "SOVEREIGN_LOCK",
      })
    );
    expect(mockNext).not.toHaveBeenCalled();
  });

  it("should allow request if no consensus is set yet (boot window)", async () => {
    vi.mocked(workers.isSystemIsolated).mockReturnValue(false);
    vi.mocked(workers.getLastConsensus).mockReturnValue(null);

    await l5ConsensusGate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });

  it("should block with 503 if consensus is stale", async () => {
    vi.mocked(workers.isSystemIsolated).mockReturnValue(false);
    vi.mocked(workers.getLastConsensus).mockReturnValue({
      round: 10,
      timestamp: Date.now() - 120_000, // 2 minutes ago (limit is 60s)
      quorumMet: true,
      respondents: 45,
    } as any);

    await l5ConsensusGate(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "CONSENSUS_STALE",
        code: "L5_GATE",
      })
    );
  });

  it("should block with 503 if consensus quorum is not met", async () => {
    vi.mocked(workers.isSystemIsolated).mockReturnValue(false);
    vi.mocked(workers.getLastConsensus).mockReturnValue({
      round: 12,
      timestamp: Date.now() - 10_000, // fresh
      quorumMet: false,
      respondents: 15,
    } as any);

    await l5ConsensusGate(mockReq, mockRes, mockNext);

    expect(mockRes.status).toHaveBeenCalledWith(503);
    expect(mockRes.json).toHaveBeenCalledWith(
      expect.objectContaining({
        error: "CONSENSUS_QUORUM_FAILURE",
        code: "L5_GATE",
      })
    );
  });

  it("should pass through if consensus is fresh and quorum is met", async () => {
    vi.mocked(workers.isSystemIsolated).mockReturnValue(false);
    vi.mocked(workers.getLastConsensus).mockReturnValue({
      round: 12,
      timestamp: Date.now() - 10_000, // fresh
      quorumMet: true,
      respondents: 54,
    } as any);

    await l5ConsensusGate(mockReq, mockRes, mockNext);

    expect(mockNext).toHaveBeenCalled();
  });
});
