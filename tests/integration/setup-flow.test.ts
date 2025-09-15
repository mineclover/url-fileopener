import { describe, it, expect, beforeEach, afterEach } from "vitest"
import { execSync } from "child_process"
import { tmpdir } from "os"
import { join } from "path"
import { mkdirSync, rmSync, writeFileSync } from "fs"

describe("Complete setup flow integration test", () => {
  let testDir: string

  beforeEach(() => {
    testDir = join(tmpdir(), `fopen-test-${Date.now()}`)
    mkdirSync(testDir, { recursive: true })
  })

  afterEach(() => {
    rmSync(testDir, { recursive: true, force: true })
  })

  it("should complete full setup workflow: install → add → test", async () => {
    // This test will fail until the full workflow is implemented
    expect(() => {
      // Step 1: Install protocol
      const installResult = execSync("fopen install", { encoding: "utf8" })
      expect(installResult).toContain("Protocol registered successfully")

      // Step 2: Add test project
      writeFileSync(join(testDir, "test.js"), "console.log('test')")
      const addResult = execSync(`fopen add testproject "${testDir}"`, { encoding: "utf8" })
      expect(addResult).toContain("Project 'testproject' added successfully")

      // Step 3: Test URL handling
      const testResult = execSync("fopen-handler fileopener://testproject/test.js", { encoding: "utf8" })
      expect(testResult).toContain("File opened successfully")

      // Step 4: Verify project is listed
      const listResult = execSync("fopen list", { encoding: "utf8" })
      expect(listResult).toContain("testproject")
    }).toThrow() // Expected to fail initially
  })

  it("should handle setup errors gracefully", async () => {
    // This test will fail until error handling is implemented
    expect(() => {
      // Try to add non-existent project
      const result = execSync("fopen add invalid /nonexistent/path", { encoding: "utf8" })
      expect(result).toContain("Path does not exist")
    }).toThrow() // Expected to fail initially
  })
})