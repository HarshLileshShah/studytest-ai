import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { formatTime, formatFileSize, truncateText, getScoreColor } from "../lib/utils";

describe("Utility Functions", () => {
  describe("formatTime", () => {
    it("should format seconds into mm:ss format", () => {
      assert.equal(formatTime(0), "00:00");
      assert.equal(formatTime(65), "01:05");
      assert.equal(formatTime(600), "10:00");
      assert.equal(formatTime(3665), "61:05");
    });
  });

  describe("formatFileSize", () => {
    it("should format bytes correctly", () => {
      assert.equal(formatFileSize(500), "500 B");
      assert.equal(formatFileSize(1024), "1.0 KB");
      assert.equal(formatFileSize(1536), "1.5 KB");
      assert.equal(formatFileSize(1048576), "1.0 MB");
      assert.equal(formatFileSize(5242880), "5.0 MB");
    });
  });

  describe("truncateText", () => {
    it("should truncate strings longer than maxLength", () => {
      assert.equal(truncateText("Hello World", 5), "Hello...");
      assert.equal(truncateText("Short", 10), "Short");
    });
  });

  describe("getScoreColor", () => {
    it("should return emerald for >=80, amber for >=60, red otherwise", () => {
      assert.equal(getScoreColor(95), "text-emerald-500");
      assert.equal(getScoreColor(80), "text-emerald-500");
      assert.equal(getScoreColor(70), "text-amber-500");
      assert.equal(getScoreColor(59), "text-red-500");
    });
  });
});
