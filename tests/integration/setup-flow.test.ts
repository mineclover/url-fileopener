import { describe, expect, it, beforeEach } from "vitest";
import { Effect, Exit } from "effect";
import { InstallCommand } from "../../src/cli/commands/install.js";
import { AddCommand } from "../../src/cli/commands/add.js";
import { ListCommand } from "../../src/cli/commands/list.js";
import { handleFileOpenUrl } from "../../src/bin/url-handler.js";

describe("Integration Test - Complete Setup Flow", () => {
  const testProjectPath = process.cwd();
  const testProjectAlias = "test-integration-project";

  beforeEach(() => {
    // Clean up any existing test configuration
    // This will be implemented when config service is available
  });

  it("should complete full setup workflow: install → add → test", async () => {
    // Step 1: Install protocol
    const installResult = await Effect.runPromiseExit(
      InstallCommand.handler({
        override: true, // Override any existing registration for testing
        terminal: false,
      })
    );

    if (Exit.isFailure(installResult)) {
      throw new Error("Installation failed - InstallCommand not implemented yet");
    }

    const installCommandResult = installResult.value;
    expect(installCommandResult.success).toBe(true);
    expect(installCommandResult.data.protocol).toBe("fileopener");
    expect(installCommandResult.data.registered).toBe(true);

    // Step 2: Add project
    const addResult = await Effect.runPromiseExit(
      AddCommand.handler({
        projectAlias: testProjectAlias,
        projectPath: testProjectPath,
        force: true,
      })
    );

    if (Exit.isFailure(addResult)) {
      throw new Error("Add project failed - AddCommand not implemented yet");
    }

    const addCommandResult = addResult.value;
    expect(addCommandResult.success).toBe(true);
    expect(addCommandResult.data.project.alias).toBe(testProjectAlias);
    expect(addCommandResult.data.project.path).toBe(testProjectPath);

    // Step 3: Verify project is listed
    const listResult = await Effect.runPromiseExit(
      ListCommand.handler({
        json: false,
        pathsOnly: false,
        aliasesOnly: false,
      })
    );

    if (Exit.isFailure(listResult)) {
      throw new Error("List projects failed - ListCommand not implemented yet");
    }

    const listCommandResult = listResult.value;
    expect(listCommandResult.success).toBe(true);
    expect(listCommandResult.data.projects).toContainEqual({
      alias: testProjectAlias,
      path: testProjectPath,
    });

    // Step 4: Test file opening
    const testUrl = `fileopener://${testProjectAlias}/package.json`;

    try {
      const fileOpenResult = await handleFileOpenUrl(testUrl);
      expect(fileOpenResult).toContain(testProjectPath);
      expect(fileOpenResult).toContain("package.json");
    } catch (error) {
      throw new Error("File opening failed - URL handler not implemented yet");
    }
  }, 30000); // Increased timeout for integration test

  it("should handle protocol already registered scenario", async () => {
    // First installation
    await Effect.runPromiseExit(
      InstallCommand.handler({
        override: false,
        terminal: false,
      })
    );

    // Second installation without override should handle gracefully
    const secondInstallResult = await Effect.runPromiseExit(
      InstallCommand.handler({
        override: false,
        terminal: false,
      })
    );

    if (Exit.isSuccess(secondInstallResult)) {
      const result = secondInstallResult.value;
      // Should either succeed (already registered) or fail with clear message
      if (!result.success) {
        expect(result.error).toContain("already registered");
      }
    } else {
      throw new Error("Duplicate registration handling not implemented yet");
    }
  });

  it("should handle complete workflow with legacy URL format", async () => {
    // Setup protocol and project (reusing from above test)
    await Effect.runPromiseExit(
      InstallCommand.handler({ override: true, terminal: false })
    );

    await Effect.runPromiseExit(
      AddCommand.handler({
        projectAlias: "legacy-test-project",
        projectPath: testProjectPath,
        force: true,
      })
    );

    // Test legacy URL format
    const legacyUrl = "fileopener://legacy-test-project?path=package.json";

    try {
      const fileOpenResult = await handleFileOpenUrl(legacyUrl);
      expect(fileOpenResult).toContain(testProjectPath);
      expect(fileOpenResult).toContain("package.json");
    } catch (error) {
      throw new Error("Legacy URL format handling not implemented yet");
    }
  });

  it("should validate end-to-end error handling", async () => {
    // Test file opening with non-existent project
    const invalidUrl = "fileopener://non-existent-project/some-file.js";

    try {
      await handleFileOpenUrl(invalidUrl);
      fail("Should have thrown error for non-existent project");
    } catch (error) {
      expect(error.message).toContain("not found");
    }

    // Test file opening with path traversal
    const maliciousUrl = `fileopener://${testProjectAlias}/../../../etc/passwd`;

    try {
      await handleFileOpenUrl(maliciousUrl);
      fail("Should have thrown error for path traversal");
    } catch (error) {
      expect(error.message).toContain("Security violation");
    }
  });

  it("should verify configuration persistence", async () => {
    // Add a project
    await Effect.runPromiseExit(
      AddCommand.handler({
        projectAlias: "persistence-test",
        projectPath: testProjectPath,
        force: true,
      })
    );

    // List projects - should still be there
    const firstListResult = await Effect.runPromiseExit(
      ListCommand.handler({
        json: false,
        pathsOnly: false,
        aliasesOnly: false,
      })
    );

    if (Exit.isSuccess(firstListResult)) {
      expect(firstListResult.value.data.projects).toContainEqual({
        alias: "persistence-test",
        path: testProjectPath,
      });
    }

    // Simulate restart by listing again (configuration should persist)
    const secondListResult = await Effect.runPromiseExit(
      ListCommand.handler({
        json: false,
        pathsOnly: false,
        aliasesOnly: false,
      })
    );

    if (Exit.isSuccess(secondListResult)) {
      expect(secondListResult.value.data.projects).toContainEqual({
        alias: "persistence-test",
        path: testProjectPath,
      });
    } else {
      throw new Error("Configuration persistence not implemented yet");
    }
  });
});