import { describe, it, expect } from "vitest"
import { execSync } from "child_process"

describe("fopen uninstall command contract", () => {
  it("should unregister the fileopener:// protocol from the system", async () => {
    // This test will fail until the uninstall command is implemented
    expect(() => {
      execSync("fopen install", { encoding: "utf8" })
      const result = execSync("fopen uninstall", { encoding: "utf8" })
      expect(result).toContain("Protocol unregistered successfully")
    }).toThrow() // Expected to fail initially
  })

  it("should handle unregistering non-existent protocol gracefully", async () => {
    // This test will fail until the uninstall command is implemented
    expect(() => {
      const result = execSync("fopen uninstall", { encoding: "utf8" })
      expect(result).toContain("Protocol not currently registered")
    }).toThrow() // Expected to fail initially
  })

  it("should optionally clean up configuration files", async () => {
    // This test will fail until the uninstall command is implemented
    expect(() => {
      execSync("fopen install", { encoding: "utf8" })
      const result = execSync("fopen uninstall --clean", { encoding: "utf8" })
      expect(result).toContain("Configuration files cleaned up")
    }).toThrow() // Expected to fail initially
  })
})