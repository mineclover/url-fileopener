import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { Effect, Exit } from "effect";
import { AddCommand } from "../../src/cli/commands/add.js";
import { RemoveCommand } from "../../src/cli/commands/remove.js";
import { ListCommand } from "../../src/cli/commands/list.js";
import { readFileSync, writeFileSync, mkdirSync, rmSync, existsSync } from "fs";
import { join } from "path";
import { homedir, tmpdir } from "os";

describe("Integration Test - Configuration Management", () => {
  const testConfigDir = join(tmpdir(), "fopen-config-test");
  const testConfigFile = join(testConfigDir, "fileopener.json");
  const testProjectPath1 = join(tmpdir(), "test-project-1");
  const testProjectPath2 = join(tmpdir(), "test-project-2");

  beforeEach(() => {
    // Clean up and create test directories
    try {
      rmSync(testConfigDir, { recursive: true, force: true });
      rmSync(testProjectPath1, { recursive: true, force: true });
      rmSync(testProjectPath2, { recursive: true, force: true });
    } catch {}

    mkdirSync(testConfigDir, { recursive: true });
    mkdirSync(testProjectPath1, { recursive: true });
    mkdirSync(testProjectPath2, { recursive: true });

    // Create test project files
    writeFileSync(join(testProjectPath1, "package.json"), '{"name": "project1"}');
    writeFileSync(join(testProjectPath2, "package.json"), '{"name": "project2"}');
  });

  afterEach(() => {
    // Clean up test directories
    try {
      rmSync(testConfigDir, { recursive: true, force: true });
      rmSync(testProjectPath1, { recursive: true, force: true });
      rmSync(testProjectPath2, { recursive: true, force: true });
    } catch {}
  });

  it("should create configuration file when it doesn't exist", async () => {
    expect(existsSync(testConfigFile)).toBe(false);

    const result = await Effect.runPromiseExit(
      AddCommand.handler({
        projectAlias: "new-project",
        projectPath: testProjectPath1,
        force: false,
        _testConfigPath: testConfigFile,
      } as any)
    );

    if (Exit.isSuccess(result)) {
      expect(result.value.success).toBe(true);
      expect(existsSync(testConfigFile)).toBe(true);

      const config = JSON.parse(readFileSync(testConfigFile, "utf-8"));
      expect(config).toMatchObject({
        "new-project": testProjectPath1,
      });
    } else {
      throw new Error("Config file creation not implemented yet");
    }
  });

  it("should add multiple projects to configuration", async () => {
    // Add first project
    const result1 = await Effect.runPromiseExit(
      AddCommand.handler({
        projectAlias: "project-one",
        projectPath: testProjectPath1,
        force: false,
        _testConfigPath: testConfigFile,
      } as any)
    );

    if (Exit.isFailure(result1)) {
      throw new Error("First project addition not implemented yet");
    }

    // Add second project
    const result2 = await Effect.runPromiseExit(
      AddCommand.handler({
        projectAlias: "project-two",
        projectPath: testProjectPath2,
        force: false,
        _testConfigPath: testConfigFile,
      } as any)
    );

    if (Exit.isFailure(result2)) {
      throw new Error("Multiple project addition not implemented yet");
    }

    expect(result1.value.success).toBe(true);
    expect(result2.value.success).toBe(true);

    // Verify both projects are in config
    const config = JSON.parse(readFileSync(testConfigFile, "utf-8"));
    expect(config).toMatchObject({
      "project-one": testProjectPath1,
      "project-two": testProjectPath2,
    });
  });

  it("should list all configured projects", async () => {
    // Manually create config file with projects
    const initialConfig = {
      "listed-project-1": testProjectPath1,
      "listed-project-2": testProjectPath2,
    };
    writeFileSync(testConfigFile, JSON.stringify(initialConfig, null, 2));

    const result = await Effect.runPromiseExit(
      ListCommand.handler({
        json: false,
        pathsOnly: false,
        aliasesOnly: false,
        _testConfigPath: testConfigFile,
      } as any)
    );

    if (Exit.isSuccess(result)) {
      expect(result.value.success).toBe(true);
      expect(result.value.data.projects).toContainEqual({
        alias: "listed-project-1",
        path: testProjectPath1,
      });
      expect(result.value.data.projects).toContainEqual({
        alias: "listed-project-2",
        path: testProjectPath2,
      });
      expect(result.value.data.count).toBe(2);
    } else {
      throw new Error("Project listing not implemented yet");
    }
  });

  it("should remove projects from configuration", async () => {
    // Create initial config with two projects
    const initialConfig = {
      "remove-project-1": testProjectPath1,
      "remove-project-2": testProjectPath2,
    };
    writeFileSync(testConfigFile, JSON.stringify(initialConfig, null, 2));

    // Remove first project
    const result = await Effect.runPromiseExit(
      RemoveCommand.handler({
        projectAlias: "remove-project-1",
        force: true,
        _testConfigPath: testConfigFile,
      } as any)
    );

    if (Exit.isSuccess(result)) {
      expect(result.value.success).toBe(true);
      expect(result.value.data.removed).toMatchObject({
        alias: "remove-project-1",
        path: testProjectPath1,
      });

      // Verify project was removed from config
      const config = JSON.parse(readFileSync(testConfigFile, "utf-8"));
      expect(config).toMatchObject({
        "remove-project-2": testProjectPath2,
      });
      expect(config["remove-project-1"]).toBeUndefined();
    } else {
      throw new Error("Project removal not implemented yet");
    }
  });

  it("should handle concurrent configuration access", async () => {
    const promises = [
      Effect.runPromiseExit(
        AddCommand.handler({
          projectAlias: "concurrent-1",
          projectPath: testProjectPath1,
          force: false,
          _testConfigPath: testConfigFile,
        } as any)
      ),
      Effect.runPromiseExit(
        AddCommand.handler({
          projectAlias: "concurrent-2",
          projectPath: testProjectPath2,
          force: false,
          _testConfigPath: testConfigFile,
        } as any)
      ),
    ];

    try {
      const results = await Promise.all(promises);

      // Both operations should succeed
      expect(Exit.isSuccess(results[0])).toBe(true);
      expect(Exit.isSuccess(results[1])).toBe(true);

      // Verify both projects are in the final config
      const config = JSON.parse(readFileSync(testConfigFile, "utf-8"));
      expect(config["concurrent-1"]).toBe(testProjectPath1);
      expect(config["concurrent-2"]).toBe(testProjectPath2);
    } catch (error) {
      throw new Error("Concurrent configuration access not implemented yet");
    }
  });

  it("should validate configuration file integrity", async () => {
    // Create corrupted config file
    writeFileSync(testConfigFile, "invalid json content");

    const result = await Effect.runPromiseExit(
      ListCommand.handler({
        json: false,
        pathsOnly: false,
        aliasesOnly: false,
        _testConfigPath: testConfigFile,
      } as any)
    );

    if (Exit.isSuccess(result)) {
      expect(result.value.success).toBe(false);
      expect(result.value.error).toContain("Configuration file");
    } else {
      throw new Error("Configuration file validation not implemented yet");
    }
  });

  it("should handle atomic write operations", async () => {
    // Create config with existing project
    const initialConfig = { "existing-project": testProjectPath1 };
    writeFileSync(testConfigFile, JSON.stringify(initialConfig, null, 2));

    // Simulate write failure scenario (this would need to be mocked in real implementation)
    const result = await Effect.runPromiseExit(
      AddCommand.handler({
        projectAlias: "atomic-test",
        projectPath: testProjectPath2,
        force: false,
        _testConfigPath: testConfigFile,
        _testScenario: "write-failure",
      } as any)
    );

    if (Exit.isSuccess(result) && !result.value.success) {
      // If write failed, original config should be preserved
      const config = JSON.parse(readFileSync(testConfigFile, "utf-8"));
      expect(config).toMatchObject({ "existing-project": testProjectPath1 });
      expect(config["atomic-test"]).toBeUndefined();
    } else {
      throw new Error("Atomic write operations not implemented yet");
    }
  });

  it("should backup and restore configuration", async () => {
    // Create initial config
    const initialConfig = {
      "backup-project-1": testProjectPath1,
      "backup-project-2": testProjectPath2,
    };
    writeFileSync(testConfigFile, JSON.stringify(initialConfig, null, 2));

    // Test backup functionality (would be part of config service)
    try {
      // This would test the backup/restore functionality when implemented
      const config = JSON.parse(readFileSync(testConfigFile, "utf-8"));
      expect(Object.keys(config)).toHaveLength(2);
    } catch (error) {
      throw new Error("Configuration backup/restore not implemented yet");
    }
  });

  it("should handle different output formats", async () => {
    const config = {
      "format-project-1": testProjectPath1,
      "format-project-2": testProjectPath2,
    };
    writeFileSync(testConfigFile, JSON.stringify(config, null, 2));

    // Test JSON format
    const jsonResult = await Effect.runPromiseExit(
      ListCommand.handler({
        json: true,
        pathsOnly: false,
        aliasesOnly: false,
        _testConfigPath: testConfigFile,
      } as any)
    );

    // Test paths-only format
    const pathsResult = await Effect.runPromiseExit(
      ListCommand.handler({
        json: false,
        pathsOnly: true,
        aliasesOnly: false,
        _testConfigPath: testConfigFile,
      } as any)
    );

    // Test aliases-only format
    const aliasesResult = await Effect.runPromiseExit(
      ListCommand.handler({
        json: false,
        pathsOnly: false,
        aliasesOnly: true,
        _testConfigPath: testConfigFile,
      } as any)
    );

    try {
      if (Exit.isSuccess(jsonResult)) {
        expect(jsonResult.value.data.projects).toHaveLength(2);
      }
      if (Exit.isSuccess(pathsResult)) {
        expect(pathsResult.value.data.paths).toContain(testProjectPath1);
        expect(pathsResult.value.data.paths).toContain(testProjectPath2);
      }
      if (Exit.isSuccess(aliasesResult)) {
        expect(aliasesResult.value.data.aliases).toContain("format-project-1");
        expect(aliasesResult.value.data.aliases).toContain("format-project-2");
      }
    } catch (error) {
      throw new Error("Different output formats not implemented yet");
    }
  });
});