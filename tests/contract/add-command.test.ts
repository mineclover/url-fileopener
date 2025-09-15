import { describe, it, expect } from "vitest"
import { execSync } from "child_process"
import path from "path"

const CLI_PATH = path.join(__dirname, "../../dist/bin-simple.cjs")

describe("fopen add command contract", () => {
  it("should add a new project alias to configuration", async () => {
    const result = execSync(`node ${CLI_PATH} add testproject /tmp`, { encoding: "utf8" })
    expect(result).toContain("Project 'testproject' added successfully")
  })

  it("should validate project path exists", async () => {
    const result = execSync(`node ${CLI_PATH} add invalid /nonexistent/path`, { encoding: "utf8" })
    expect(result).toContain("Path does not exist")
  })

  it("should update existing project alias", async () => {
    execSync(`node ${CLI_PATH} add testproject /tmp`, { encoding: "utf8" })
    const result = execSync(`node ${CLI_PATH} add testproject /usr`, { encoding: "utf8" })
    expect(result).toContain("Project 'testproject' added successfully")
  })

  it("should require both project name and path arguments", async () => {
    const result = execSync(`node ${CLI_PATH} add`, { encoding: "utf8" })
    expect(result).toContain("Missing required arguments")
  })
})