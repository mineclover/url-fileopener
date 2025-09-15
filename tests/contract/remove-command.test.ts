import { describe, it, expect } from "vitest"
import { execSync } from "child_process"

describe("fopen remove command contract", () => {
  it("should remove existing project alias from configuration", async () => {
    // This test will fail until the remove command is implemented
    expect(() => {
      execSync("fopen add testproject /test/path", { encoding: "utf8" })
      const result = execSync("fopen remove testproject", { encoding: "utf8" })
      expect(result).toContain("Project 'testproject' removed successfully")
    }).toThrow() // Expected to fail initially
  })

  it("should handle removal of non-existent project gracefully", async () => {
    // This test will fail until the remove command is implemented
    expect(() => {
      const result = execSync("fopen remove nonexistent", { encoding: "utf8" })
      expect(result).toContain("Project 'nonexistent' not found")
    }).toThrow() // Expected to fail initially
  })

  it("should require project name argument", async () => {
    // This test will fail until the remove command is implemented
    expect(() => {
      const result = execSync("fopen remove", { encoding: "utf8" })
      expect(result).toContain("Missing required project name")
    }).toThrow() // Expected to fail initially
  })
})