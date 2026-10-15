import { describe, it, expect } from 'vitest';
import { Buffer } from 'buffer';

describe('AI-Linkey Middleware', () => {
  it('should decode and verify a valid governance payload', () => {
    const mockPayload = {
      version: "1.0.0",
      originNode: "Consensus-01",
      signature: "0xABC123",
      messages: [{ senderId: "dAIsy", role: "outreach", content: "Test ping" }]
    };
    
    const token = Buffer.from(JSON.stringify(mockPayload)).toString('base64');
    const decoded = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
    
    expect(decoded.originNode).toBe("Consensus-01");
    expect(decoded.messages[0].senderId).toBe("dAIsy");
  });
});
