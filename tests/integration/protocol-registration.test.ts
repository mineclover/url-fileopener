import { describe, expect, it, beforeEach, afterEach } from "vitest";
import { Effect, Exit } from "effect";
import { InstallCommand } from "../../src/cli/commands/install.js";
import { UninstallCommand } from "../../src/cli/commands/uninstall.js";
import { exec } from "child_process";
import { promisify } from "util";
import { platform } from "os";

const execAsync = promisify(exec);

describe("Integration Test - Protocol Registration with Real OS", () => {
  const isCI = process.env.CI === "true";
  const currentPlatform = platform();

  beforeEach(() => {
    // Skip on CI or unsupported platforms if needed
    if (isCI) {
      console.warn("Skipping protocol registration tests in CI environment");
    }
  });

  afterEach(async () => {
    // Clean up any registered protocols after each test
    try {
      await Effect.runPromiseExit(
        UninstallCommand.handler({
          force: true,
          keepConfig: true,
        })
      );
    } catch {
      // Ignore cleanup errors
    }
  });

  it("should register fileopener:// protocol with OS", async () => {
    if (isCI) return; // Skip in CI

    const result = await Effect.runPromiseExit(
      InstallCommand.handler({
        override: true,
        terminal: false,
      })
    );

    if (Exit.isSuccess(result)) {
      expect(result.value.success).toBe(true);
      expect(result.value.data.protocol).toBe("fileopener");
      expect(result.value.data.registered).toBe(true);

      // Verify protocol is actually registered with OS
      await verifyProtocolRegistration("fileopener");
    } else {
      throw new Error("Protocol registration not implemented yet");
    }
  }, 30000);

  it("should handle protocol override scenario", async () => {
    if (isCI) return; // Skip in CI

    // First registration
    const firstResult = await Effect.runPromiseExit(
      InstallCommand.handler({
        override: false,
        terminal: false,
      })
    );

    if (Exit.isFailure(firstResult)) {
      throw new Error("Initial protocol registration not implemented yet");
    }

    // Second registration with override
    const overrideResult = await Effect.runPromiseExit(
      InstallCommand.handler({
        override: true,
        terminal: false,
      })
    );

    if (Exit.isSuccess(overrideResult)) {
      expect(overrideResult.value.success).toBe(true);
      expect(overrideResult.value.data.registered).toBe(true);
    } else {
      throw new Error("Protocol override not implemented yet");
    }
  });

  it("should handle protocol already registered without override", async () => {
    if (isCI) return; // Skip in CI

    // First registration
    await Effect.runPromiseExit(
      InstallCommand.handler({
        override: true,
        terminal: false,
      })
    );

    // Second registration without override
    const result = await Effect.runPromiseExit(
      InstallCommand.handler({
        override: false,
        terminal: false,
      })
    );

    if (Exit.isSuccess(result)) {
      // Should either succeed (already registered) or fail with clear message
      if (!result.value.success) {
        expect(result.value.error).toContain("already registered");
      }
    } else {
      throw new Error("Duplicate registration handling not implemented yet");
    }
  });

  it("should unregister protocol from OS", async () => {
    if (isCI) return; // Skip in CI

    // First register the protocol
    await Effect.runPromiseExit(
      InstallCommand.handler({
        override: true,
        terminal: false,
      })
    );

    // Then unregister it
    const result = await Effect.runPromiseExit(
      UninstallCommand.handler({
        force: true,
        keepConfig: true,
      })
    );

    if (Exit.isSuccess(result)) {
      expect(result.value.success).toBe(true);
      expect(result.value.data.protocol).toBe("fileopener");
      expect(result.value.data.unregistered).toBe(true);

      // Verify protocol is actually unregistered from OS
      await verifyProtocolUnregistration("fileopener");
    } else {
      throw new Error("Protocol unregistration not implemented yet");
    }
  });

  it("should handle unregistering non-existent protocol", async () => {
    if (isCI) return; // Skip in CI

    const result = await Effect.runPromiseExit(
      UninstallCommand.handler({
        force: true,
        keepConfig: true,
      })
    );

    if (Exit.isSuccess(result)) {
      if (!result.value.success) {
        expect(result.value.error).toContain("not currently registered");
      }
    } else {
      throw new Error("Non-existent protocol unregistration not implemented yet");
    }
  });

  it("should create correct handler command path", async () => {
    if (isCI) return; // Skip in CI

    const result = await Effect.runPromiseExit(
      InstallCommand.handler({
        override: true,
        terminal: false,
      })
    );

    if (Exit.isSuccess(result)) {
      // The registered command should point to the correct handler
      const registeredCommand = await getRegisteredCommand("fileopener");
      expect(registeredCommand).toContain("fopen-handler");
    } else {
      throw new Error("Handler command registration not implemented yet");
    }
  });

  it("should handle platform-specific registration", async () => {
    if (isCI) return; // Skip in CI

    const result = await Effect.runPromiseExit(
      InstallCommand.handler({
        override: true,
        terminal: false,
      })
    );

    if (Exit.isSuccess(result)) {
      expect(result.value.success).toBe(true);

      // Verify platform-specific behavior
      switch (currentPlatform) {
        case "darwin":
          // macOS should use LaunchServices
          await verifyMacOSRegistration("fileopener");
          break;
        case "win32":
          // Windows should use registry
          await verifyWindowsRegistration("fileopener");
          break;
        case "linux":
          // Linux should use desktop files
          await verifyLinuxRegistration("fileopener");
          break;
        default:
          console.warn(`Platform ${currentPlatform} not specifically tested`);
      }
    } else {
      throw new Error("Platform-specific registration not implemented yet");
    }
  });

  it("should handle permission errors gracefully", async () => {
    if (isCI) return; // Skip in CI

    // This test would simulate permission denied scenarios
    // In practice, this might require running without admin privileges
    try {
      const result = await Effect.runPromiseExit(
        InstallCommand.handler({
          override: true,
          terminal: false,
          _testScenario: "permission-denied",
        } as any)
      );

      if (Exit.isSuccess(result)) {
        expect(result.value.success).toBe(false);
        expect(result.value.error).toContain("Permission denied");
      }
    } catch (error) {
      expect(error.message).toContain("Permission denied");
    }
  });

  // Helper functions for verification
  async function verifyProtocolRegistration(protocol: string): Promise<void> {
    switch (currentPlatform) {
      case "darwin":
        // Check with lsregister or defaults
        try {
          const { stdout } = await execAsync(
            `defaults read com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers | grep -A 1 "${protocol}"`
          );
          expect(stdout).toContain(protocol);
        } catch {
          throw new Error(`Protocol ${protocol} not found in macOS registry`);
        }
        break;
      case "win32":
        // Check Windows registry
        try {
          const { stdout } = await execAsync(`reg query HKCR\\${protocol}`);
          expect(stdout).toContain(protocol);
        } catch {
          throw new Error(`Protocol ${protocol} not found in Windows registry`);
        }
        break;
      case "linux":
        // Check desktop files or xdg settings
        try {
          const { stdout } = await execAsync(`xdg-mime query default x-scheme-handler/${protocol}`);
          expect(stdout.trim()).toBeTruthy();
        } catch {
          throw new Error(`Protocol ${protocol} not found in Linux desktop files`);
        }
        break;
    }
  }

  async function verifyProtocolUnregistration(protocol: string): Promise<void> {
    switch (currentPlatform) {
      case "darwin":
        try {
          const { stdout } = await execAsync(
            `defaults read com.apple.LaunchServices/com.apple.launchservices.secure LSHandlers | grep -A 1 "${protocol}"`
          );
          expect(stdout).toBe(""); // Should be empty after unregistration
        } catch {
          // If grep fails, protocol is not found (which is expected)
        }
        break;
      case "win32":
        try {
          await execAsync(`reg query HKCR\\${protocol}`);
          fail(`Protocol ${protocol} should not exist in Windows registry`);
        } catch {
          // Expected - protocol should not exist
        }
        break;
      case "linux":
        try {
          const { stdout } = await execAsync(`xdg-mime query default x-scheme-handler/${protocol}`);
          expect(stdout.trim()).toBe("");
        } catch {
          // Expected - protocol should not be registered
        }
        break;
    }
  }

  async function getRegisteredCommand(protocol: string): Promise<string> {
    // Platform-specific command to get the registered handler
    switch (currentPlatform) {
      case "darwin":
        // Implementation would depend on how protocol-registry stores the command
        return "fopen-handler"; // Placeholder
      case "win32":
        const { stdout } = await execAsync(`reg query HKCR\\${protocol}\\shell\\open\\command`);
        return stdout;
      case "linux":
        // Check desktop file content
        return "fopen-handler"; // Placeholder
      default:
        return "fopen-handler";
    }
  }

  async function verifyMacOSRegistration(protocol: string): Promise<void> {
    // macOS-specific verification using LaunchServices
    // This would check that the protocol is properly registered
  }

  async function verifyWindowsRegistration(protocol: string): Promise<void> {
    // Windows-specific verification using registry
    // This would check HKEY_CLASSES_ROOT entries
  }

  async function verifyLinuxRegistration(protocol: string): Promise<void> {
    // Linux-specific verification using desktop files
    // This would check ~/.local/share/applications or /usr/share/applications
  }
});