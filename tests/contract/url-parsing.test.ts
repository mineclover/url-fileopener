import { describe, expect, it } from "vitest";
import { parseUrl } from "../../src/services/file-opener/url-parser.js";
import { FileOpenRequest } from "../../src/models/FileOpenRequest.js";

describe("URL Parsing Contract - Modern Format", () => {
  it("should parse simple modern format URL", () => {
    const url = "fileopener://my-project/src/index.js";

    try {
      const request: FileOpenRequest = parseUrl(url);
      expect(request).toMatchObject({
        protocol: "fileopener",
        projectAlias: "my-project",
        filePath: "src/index.js",
        isLegacyFormat: false,
      });
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("parseUrl function not implemented yet");
    }
  });

  it("should parse nested path modern format URL", () => {
    const url = "fileopener://website/public/assets/style.css";

    try {
      const request: FileOpenRequest = parseUrl(url);
      expect(request).toMatchObject({
        protocol: "fileopener",
        projectAlias: "website",
        filePath: "public/assets/style.css",
        isLegacyFormat: false,
      });
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("Nested path parsing not implemented yet");
    }
  });

  it("should handle special config URL", () => {
    const url = "fileopener://config";

    try {
      const request: FileOpenRequest = parseUrl(url);
      expect(request).toMatchObject({
        protocol: "fileopener",
        projectAlias: "config",
        filePath: "",
        isLegacyFormat: false,
      });
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("Special config URL not implemented yet");
    }
  });

  it("should handle URLs with encoded characters", () => {
    const url = "fileopener://my-project/src/file%20with%20spaces.js";

    try {
      const request: FileOpenRequest = parseUrl(url);
      expect(request).toMatchObject({
        protocol: "fileopener",
        projectAlias: "my-project",
        filePath: "src/file with spaces.js",
        isLegacyFormat: false,
      });
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("URL decoding not implemented yet");
    }
  });

  it("should validate protocol scheme", () => {
    const invalidUrls = [
      "http://my-project/src/index.js",
      "https://my-project/src/index.js",
      "file://my-project/src/index.js",
      "ftp://my-project/src/index.js",
    ];

    for (const url of invalidUrls) {
      try {
        parseUrl(url);
        fail(`Should have thrown error for invalid protocol: ${url}`);
      } catch (error) {
        expect(error.message).toContain("Invalid protocol");
      }
    }
  });

  it("should validate project alias format", () => {
    const invalidUrls = [
      "fileopener:///src/index.js", // empty project alias
      "fileopener://invalid space/src/index.js", // space in alias
      "fileopener://invalid/slash/src/index.js", // slash in alias
      "fileopener://invalid@symbol/src/index.js", // invalid symbol
    ];

    for (const url of invalidUrls) {
      try {
        parseUrl(url);
        fail(`Should have thrown error for invalid project alias: ${url}`);
      } catch (error) {
        expect(error.message).toContain("Invalid project alias");
      }
    }
  });

  it("should handle URLs without file path", () => {
    const url = "fileopener://my-project";

    try {
      parseUrl(url);
      fail("Should have thrown error for missing file path");
    } catch (error) {
      expect(error.message).toContain("File path not found");
    }
  });

  it("should handle malformed URLs", () => {
    const malformedUrls = [
      "fileopener:",
      "fileopener://",
      "not-a-url",
      "",
      "fileopener",
    ];

    for (const url of malformedUrls) {
      try {
        parseUrl(url);
        fail(`Should have thrown error for malformed URL: ${url}`);
      } catch (error) {
        expect(error.message).toContain("Invalid URL format");
      }
    }
  });
});