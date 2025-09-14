import { describe, expect, it } from "vitest";
import { validatePathSecurity } from "../../src/services/file-opener/path-resolver.js";

describe("Security Validation Contract - Path Traversal Protection", () => {
  const projectBasePath = "/Users/developer/my-project";

  it("should allow valid relative paths within project", () => {
    const validPaths = [
      "src/index.js",
      "src/components/Button.tsx",
      "docs/README.md",
      "public/assets/style.css",
      "nested/deep/file.txt",
    ];

    for (const relativePath of validPaths) {
      try {
        const result = validatePathSecurity(projectBasePath, relativePath);
        expect(result.isValid).toBe(true);
        expect(result.resolvedPath).toContain(projectBasePath);
        expect(result.resolvedPath).toContain(relativePath);
      } catch (error) {
        // This test should fail initially (TDD RED phase)
        throw new Error(`Path validation not implemented for: ${relativePath}`);
      }
    }
  });

  it("should block path traversal attempts", () => {
    const maliciousPaths = [
      "../../../etc/passwd",
      "../../outside-project/file.js",
      "../../../../../../../etc/hosts",
      "src/../../../etc/passwd",
      "src/../../outside/file.js",
    ];

    for (const maliciousPath of maliciousPaths) {
      try {
        const result = validatePathSecurity(projectBasePath, maliciousPath);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("Path traversal");
      } catch (error) {
        expect(error.message).toContain("Security violation");
      }
    }
  });

  it("should handle complex path traversal attempts", () => {
    const complexMaliciousPaths = [
      "src/../../../etc/passwd",
      "public/../../../../../../etc/hosts",
      "docs/../../../outside-project/sensitive.txt",
      "./../../../../../../var/log/system.log",
      "normal-looking-path/../../../etc/shadow",
    ];

    for (const path of complexMaliciousPaths) {
      try {
        const result = validatePathSecurity(projectBasePath, path);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("Path traversal");
      } catch (error) {
        expect(error.message).toContain("Security violation");
      }
    }
  });

  it("should handle URL-encoded path traversal attempts", () => {
    const encodedMaliciousPaths = [
      "..%2F..%2F..%2Fetc%2Fpasswd",
      "src%2F..%2F..%2F..%2Fetc%2Fhosts",
      "..%252F..%252F..%252Fetc%252Fpasswd", // Double-encoded
    ];

    for (const path of encodedMaliciousPaths) {
      try {
        const decodedPath = decodeURIComponent(path);
        const result = validatePathSecurity(projectBasePath, decodedPath);
        expect(result.isValid).toBe(false);
        expect(result.error).toContain("Path traversal");
      } catch (error) {
        expect(error.message).toContain("Security violation");
      }
    }
  });

  it("should handle edge cases safely", () => {
    const edgeCases = [
      "", // empty path
      ".", // current directory
      "..", // parent directory
      "/absolute/path", // absolute path
      "C:\\Windows\\System32\\config", // Windows absolute path
    ];

    for (const edgeCase of edgeCases) {
      try {
        const result = validatePathSecurity(projectBasePath, edgeCase);
        if (edgeCase === "") {
          expect(result.isValid).toBe(false);
          expect(result.error).toContain("Empty path");
        } else if (edgeCase === ".." || edgeCase === ".") {
          expect(result.isValid).toBe(false);
          expect(result.error).toContain("Invalid path");
        } else if (edgeCase.startsWith("/") || edgeCase.includes(":\\")) {
          expect(result.isValid).toBe(false);
          expect(result.error).toContain("Absolute path");
        }
      } catch (error) {
        expect(error.message).toContain("Security violation");
      }
    }
  });

  it("should resolve paths correctly for valid cases", () => {
    const testCases = [
      {
        relativePath: "src/index.js",
        expectedResolved: `${projectBasePath}/src/index.js`,
      },
      {
        relativePath: "docs/api/README.md",
        expectedResolved: `${projectBasePath}/docs/api/README.md`,
      },
    ];

    for (const testCase of testCases) {
      try {
        const result = validatePathSecurity(projectBasePath, testCase.relativePath);
        expect(result.isValid).toBe(true);
        expect(result.resolvedPath).toBe(testCase.expectedResolved);
      } catch (error) {
        // This test should fail initially (TDD RED phase)
        throw new Error(`Path resolution not implemented for: ${testCase.relativePath}`);
      }
    }
  });

  it("should normalize paths correctly", () => {
    const pathsToNormalize = [
      {
        input: "src//index.js", // double slash
        expected: "src/index.js",
      },
      {
        input: "src/./index.js", // current directory reference
        expected: "src/index.js",
      },
      {
        input: "src/components/../index.js", // parent directory (but still within project)
        expected: "src/index.js",
      },
    ];

    for (const testCase of pathsToNormalize) {
      try {
        const result = validatePathSecurity(projectBasePath, testCase.input);
        expect(result.isValid).toBe(true);
        expect(result.normalizedPath).toBe(testCase.expected);
      } catch (error) {
        // This test should fail initially (TDD RED phase)
        throw new Error(`Path normalization not implemented for: ${testCase.input}`);
      }
    }
  });

  it("should provide detailed security violation information", () => {
    const maliciousPath = "../../../etc/passwd";

    try {
      const result = validatePathSecurity(projectBasePath, maliciousPath);
      expect(result.isValid).toBe(false);
      expect(result.error).toContain("Path traversal");
      expect(result.attemptedPath).toBe(maliciousPath);
      expect(result.projectBasePath).toBe(projectBasePath);
    } catch (error) {
      expect(error.message).toContain("Security violation");
      expect(error.message).toContain("path traversal");
    }
  });
});