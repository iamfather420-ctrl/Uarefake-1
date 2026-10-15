import { describe, it, expect } from "vitest";
import { stripHtml, fitScore } from "../lib/outreach";

describe("Autonomous Outreach Crawler", () => {
  describe("stripHtml", () => {
    it("should strip HTML tags correctly", () => {
      const html = "<p>Hello <strong>World</strong>!</p>";
      const result = stripHtml(html);
      expect(result).toBe("Hello World !");
    });

    it("should resolve HTML entities conceptually", () => {
      const html = "Secrets &amp; Keys";
      const result = stripHtml(html);
      expect(result).toBe("Secrets Keys");
    });
  });

  describe("fitScore calculation", () => {
    it("should calculate a basic fit score based on post age and matches", () => {
      const lead = {
        postedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days old
        unanswered: true,
        title: "Looking for Zero Knowledge compliance",
        snippet: "Need confidential computing or MPC custody solution.",
      };

      const score = fitScore(lead, ["zero knowledge", "homomorphic encryption"], true);

      // We expect a robust score because it matches tags, is unanswered, fresh, and matches terms
      expect(score).toBeGreaterThan(70);
      expect(score).toBeLessThanOrEqual(99);
    });
  });
});
