import { describe, it, expect } from "vitest"
import { execSync } from "child_process"
import path from "path"

const CLI_PATH = path.join(__dirname, "../../dist/bin-simple.cjs")

describe("fopen remove command contract", () => {
  it("should remove existing project alias from configuration", async () => {
    execSync(`node ${CLI_PATH} add testproject /tmp`, { encoding: "utf8" })
    const result = execSync(`node ${CLI_PATH} remove testproject`, { encoding: "utf8" })
    expect(result).toContain("Project 'testproject' removed successfully")
  })

  it("should handle removal of non-existent project gracefully", async () => {
    const result = execSync(`node ${CLI_PATH} remove nonexistent`, { encoding: "utf8" })
    expect(result).toContain("Project 'nonexistent' not found")
  })

  it("should require project name argument", async () => {
    const result = execSync(`node ${CLI_PATH} remove`, { encoding: "utf8" })
    expect(result).toContain("Missing required project name")
  })
})