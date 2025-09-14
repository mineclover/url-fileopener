import { describe, expect, it, beforeEach } from "vitest";
import { handleFileOpenUrl } from "../../src/bin/url-handler.js";
import { writeFileSync, mkdirSync, rmSync } from "fs";
import { join } from "path";
import { tmpdir } from "os";

describe("Integration Test - File Opening Workflow", () => {
  const testProjectPath = join(tmpdir(), "fopen-test-project");
  const testProjectAlias = "file-opening-test";

  beforeEach(() => {
    // Create test project directory and files
    try {
      rmSync(testProjectPath, { recursive: true, force: true });
    } catch {}

    mkdirSync(testProjectPath, { recursive: true });
    mkdirSync(join(testProjectPath, "src"), { recursive: true });
    mkdirSync(join(testProjectPath, "docs"), { recursive: true });

    // Create test files
    writeFileSync(join(testProjectPath, "package.json"), '{"name": "test-package"}');
    writeFileSync(join(testProjectPath, "README.md"), "# Test Project");
    writeFileSync(join(testProjectPath, "src", "index.js"), "console.log('Hello');");
    writeFileSync(join(testProjectPath, "docs", "api.md"), "# API Documentation");
    writeFileSync(join(testProjectPath, "file with spaces.txt"), "Test content");
  });

  it("should open file successfully with modern URL format", async () => {
    const url = `fileopener://${testProjectAlias}/package.json`;

    try {
      const result = await handleFileOpenUrl(url);
      expect(result).toContain(testProjectPath);
      expect(result).toContain("package.json");
      expect(result).toBe(join(testProjectPath, "package.json"));
    } catch (error) {
      throw new Error("Modern URL format file opening not implemented yet");
    }
  });

  it("should open nested file successfully", async () => {
    const url = `fileopener://${testProjectAlias}/src/index.js`;

    try {
      const result = await handleFileOpenUrl(url);
      expect(result).toContain(testProjectPath);
      expect(result).toContain("src/index.js");
      expect(result).toBe(join(testProjectPath, "src", "index.js"));
    } catch (error) {
      throw new Error("Nested file opening not implemented yet");
    }
  });

  it("should open file with legacy URL format", async () => {
    const url = `fileopener://${testProjectAlias}?path=docs/api.md`;

    try {
      const result = await handleFileOpenUrl(url);
      expect(result).toContain(testProjectPath);
      expect(result).toContain("docs/api.md");
      expect(result).toBe(join(testProjectPath, "docs", "api.md"));
    } catch (error) {
      throw new Error("Legacy URL format file opening not implemented yet");
    }
  });

  it("should handle URL-encoded file names", async () => {
    const url = `fileopener://${testProjectAlias}/file%20with%20spaces.txt`;

    try {
      const result = await handleFileOpenUrl(url);
      expect(result).toContain(testProjectPath);
      expect(result).toContain("file with spaces.txt");
      expect(result).toBe(join(testProjectPath, "file with spaces.txt"));
    } catch (error) {
      throw new Error("URL decoding for file names not implemented yet");
    }
  });

  it("should open special config URL", async () => {
    const url = "fileopener://config";

    try {
      const result = await handleFileOpenUrl(url);
      expect(result).toContain(".protocol-registry");
      expect(result).toContain("fileopener.json");
    } catch (error) {
      throw new Error("Special config URL handling not implemented yet");
    }
  });

  it("should handle file not found errors gracefully", async () => {
    const url = `fileopener://${testProjectAlias}/non-existent-file.js`;

    try {
      await handleFileOpenUrl(url);
      fail("Should have thrown error for non-existent file");
    } catch (error) {
      expect(error.message).toContain("File does not exist");
    }
  });

  it("should handle project not found errors", async () => {
    const url = "fileopener://unknown-project/some-file.js";

    try {
      await handleFileOpenUrl(url);
      fail("Should have thrown error for unknown project");
    } catch (error) {
      expect(error.message).toContain("not found in configuration");
    }
  });

  it("should prevent path traversal attacks", async () => {
    const maliciousUrls = [
      `fileopener://${testProjectAlias}/../../../etc/passwd`,
      `fileopener://${testProjectAlias}?path=../../../etc/passwd`,
      `fileopener://${testProjectAlias}/src/../../../etc/hosts`,
    ];

    for (const url of maliciousUrls) {
      try {
        await handleFileOpenUrl(url);
        fail(`Should have blocked path traversal for: ${url}`);
      } catch (error) {
        expect(error.message).toContain("Security violation");
      }
    }
  });

  it("should log file opening operations", async () => {
    const url = `fileopener://${testProjectAlias}/package.json`;

    try {
      await handleFileOpenUrl(url);

      // Check that logging occurred (this will depend on logging implementation)
      // For now, just verify the operation doesn't throw
      expect(true).toBe(true);
    } catch (error) {
      throw new Error("File opening with logging not implemented yet");
    }
  });

  it("should handle various file types correctly", async () => {
    // Create files with different extensions
    const testFiles = [
      "script.js",
      "style.css",
      "document.md",
      "config.json",
      "image.png",
      "data.txt",
    ];

    for (const fileName of testFiles) {
      writeFileSync(join(testProjectPath, fileName), "test content");
    }

    for (const fileName of testFiles) {
      const url = `fileopener://${testProjectAlias}/${fileName}`;

      try {
        const result = await handleFileOpenUrl(url);
        expect(result).toBe(join(testProjectPath, fileName));
      } catch (error) {
        throw new Error(`File type handling not implemented for: ${fileName}`);
      }
    }
  });

  it("should handle concurrent file opening requests", async () => {
    const urls = [
      `fileopener://${testProjectAlias}/package.json`,
      `fileopener://${testProjectAlias}/src/index.js`,
      `fileopener://${testProjectAlias}/docs/api.md`,
    ];

    try {
      const promises = urls.map(url => handleFileOpenUrl(url));
      const results = await Promise.all(promises);

      expect(results).toHaveLength(3);
      expect(results[0]).toContain("package.json");
      expect(results[1]).toContain("src/index.js");
      expect(results[2]).toContain("docs/api.md");
    } catch (error) {
      throw new Error("Concurrent file opening not implemented yet");
    }
  });
});