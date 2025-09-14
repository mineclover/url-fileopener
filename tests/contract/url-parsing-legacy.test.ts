import { describe, expect, it } from "vitest";
import { parseUrl } from "../../src/services/file-opener/url-parser.js";
import { FileOpenRequest } from "../../src/models/FileOpenRequest.js";

describe("URL Parsing Contract - Legacy Format", () => {
  it("should parse simple legacy format URL", () => {
    const url = "fileopener://my-project?path=src/index.js";

    try {
      const request: FileOpenRequest = parseUrl(url);
      expect(request).toMatchObject({
        protocol: "fileopener",
        projectAlias: "my-project",
        filePath: "src/index.js",
        isLegacyFormat: true,
      });
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("Legacy format parsing not implemented yet");
    }
  });

  it("should parse nested path legacy format URL", () => {
    const url = "fileopener://website?path=public/assets/style.css";

    try {
      const request: FileOpenRequest = parseUrl(url);
      expect(request).toMatchObject({
        protocol: "fileopener",
        projectAlias: "website",
        filePath: "public/assets/style.css",
        isLegacyFormat: true,
      });
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("Legacy nested path parsing not implemented yet");
    }
  });

  it("should handle encoded characters in legacy format", () => {
    const url = "fileopener://my-project?path=src/file%20with%20spaces.js";

    try {
      const request: FileOpenRequest = parseUrl(url);
      expect(request).toMatchObject({
        protocol: "fileopener",
        projectAlias: "my-project",
        filePath: "src/file with spaces.js",
        isLegacyFormat: true,
      });
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("Legacy URL decoding not implemented yet");
    }
  });

  it("should handle legacy format with additional query parameters", () => {
    const url = "fileopener://my-project?path=src/index.js&other=value";

    try {
      const request: FileOpenRequest = parseUrl(url);
      expect(request).toMatchObject({
        protocol: "fileopener",
        projectAlias: "my-project",
        filePath: "src/index.js",
        isLegacyFormat: true,
      });
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("Legacy format with additional params not implemented yet");
    }
  });

  it("should handle legacy format without path parameter", () => {
    const url = "fileopener://my-project?other=value";

    try {
      parseUrl(url);
      fail("Should have thrown error for missing path parameter");
    } catch (error) {
      expect(error.message).toContain("File path not found");
    }
  });

  it("should handle legacy format with empty path parameter", () => {
    const url = "fileopener://my-project?path=";

    try {
      parseUrl(url);
      fail("Should have thrown error for empty path parameter");
    } catch (error) {
      expect(error.message).toContain("File path not found");
    }
  });

  it("should distinguish between modern and legacy formats", () => {
    const modernUrl = "fileopener://my-project/src/index.js";
    const legacyUrl = "fileopener://my-project?path=src/index.js";

    try {
      const modernRequest = parseUrl(modernUrl);
      const legacyRequest = parseUrl(legacyUrl);

      expect(modernRequest.isLegacyFormat).toBe(false);
      expect(legacyRequest.isLegacyFormat).toBe(true);

      // Both should result in the same file path
      expect(modernRequest.filePath).toBe(legacyRequest.filePath);
      expect(modernRequest.projectAlias).toBe(legacyRequest.projectAlias);
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("Format distinction not implemented yet");
    }
  });

  it("should handle complex file paths in legacy format", () => {
    const url = "fileopener://protocol-registry?path=examples/file-opener-demo/config-manager.js";

    try {
      const request: FileOpenRequest = parseUrl(url);
      expect(request).toMatchObject({
        protocol: "fileopener",
        projectAlias: "protocol-registry",
        filePath: "examples/file-opener-demo/config-manager.js",
        isLegacyFormat: true,
      });
    } catch (error) {
      // This test should fail initially (TDD RED phase)
      throw new Error("Complex legacy path parsing not implemented yet");
    }
  });
});