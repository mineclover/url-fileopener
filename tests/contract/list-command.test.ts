import { describe, it, expect, beforeEach } from "vitest"
import { execSync } from "child_process"
import path from "path"
import fs from "fs"
import os from "os"

const CLI_PATH = path.join(__dirname, "../../dist/bin-simple.cjs")
const CONFIG_DIR = path.join(os.homedir(), '.fopen-cli')
const CONFIG_FILE = path.join(CONFIG_DIR, 'config.json')

describe("fopen list command contract", () => {
  beforeEach(() => {
    // Clean up config before each test
    if (fs.existsSync(CONFIG_FILE)) {
      fs.unlinkSync(CONFIG_FILE)
    }
  })

  it("should display all configured project aliases", async () => {
    execSync(`node ${CLI_PATH} add testproject /tmp`, { encoding: "utf8" })
    const result = execSync(`node ${CLI_PATH} list`, { encoding: "utf8" })
    expect(result).toContain("Configured projects:")
  })

  it("should show empty message when no projects configured", async () => {
    const result = execSync(`node ${CLI_PATH} list`, { encoding: "utf8" })
    expect(result).toContain("No projects configured")
  })

  it("should display project names and paths in readable format", async () => {
    execSync(`node ${CLI_PATH} add testproject /tmp`, { encoding: "utf8" })
    const result = execSync(`node ${CLI_PATH} list`, { encoding: "utf8" })
    expect(result).toContain("testproject -> /tmp")
  })
})