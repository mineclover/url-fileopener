import { Effect, Layer } from "effect"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { FileOpener, FileOpenerNode } from "../services/file-opener/index.js"
import { ConfigManagerNode } from "../services/config-manager/index.js"
import { LoggerNode, Logger } from "../services/logging/index.js"
import { exec } from "child_process"
import { promisify } from "util"

const execAsync = promisify(exec)

// Function to detect and open with appropriate editor
const openWithEditor = async (filePath: string, lineNumber?: number, columnNumber?: number): Promise<void> => {
  let command: string

  // Check for VS Code
  try {
    await execAsync("code --version")
    command = "code"
    if (lineNumber) {
      command += ` --goto "${filePath}:${lineNumber}${columnNumber ? `:${columnNumber}` : ""}"`
    } else {
      command += ` "${filePath}"`
    }
  } catch {
    // Check for vim
    try {
      await execAsync("vim --version")
      command = lineNumber ? `vim +${lineNumber} "${filePath}"` : `vim "${filePath}"`
    } catch {
      // Check for nano
      try {
        await execAsync("nano --version")
        command = lineNumber ? `nano +${lineNumber} "${filePath}"` : `nano "${filePath}"`
      } catch {
        // Fall back to system default
        if (process.platform === "darwin") {
          command = `open "${filePath}"`
        } else if (process.platform === "win32") {
          command = `start "" "${filePath}"`
        } else {
          command = `xdg-open "${filePath}"`
        }
      }
    }
  }

  console.log(`Executing: ${command}`)
  await execAsync(command)
}

// Main handler function
export const handleFileOpenUrl = (url: string) => Effect.gen(function* () {
  const fileOpener = yield* FileOpener
  const logger = yield* Logger

  yield* logger.info("Handling file open request", { url })

  try {
    // Parse and resolve the file request
    const resolved = yield* fileOpener.parseAndResolve(url)

    yield* logger.info("File resolved successfully", {
      absolutePath: resolved.absolutePath,
      exists: resolved.exists,
      projectAlias: resolved.request.projectAlias,
      filePath: resolved.request.filePath,
      lineNumber: resolved.request.lineNumber,
      columnNumber: resolved.request.columnNumber
    })

    // Open the file with an appropriate editor
    yield* Effect.tryPromise(() =>
      openWithEditor(
        resolved.absolutePath,
        resolved.request.lineNumber,
        resolved.request.columnNumber
      )
    )

    yield* logger.info("File opened successfully")

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)

    yield* logger.error("Failed to open file", {
      url,
      error: errorMessage,
      stack: error instanceof Error ? error.stack : undefined
    })

    throw error
  }
})

// Main application layer
const MainLayer = Layer.mergeAll(
  ConfigManagerNode,
  FileOpenerNode,
  LoggerNode
)

// Entry point when called directly
if (import.meta.url === `file://${process.argv[1]}`) {
  const url = process.argv[2]

  if (!url) {
    console.error("Usage: fopen-handler <fileopener-url>")
    process.exit(1)
  }

  if (!url.startsWith("fileopener://")) {
    console.error("Invalid URL: must start with fileopener://")
    process.exit(1)
  }

  // Run the handler
  const program = handleFileOpenUrl(url).pipe(
    Effect.provide(MainLayer),
    Effect.provide(NodeContext.layer)
  )

  Effect.runPromise(program).catch((error) => {
    console.error("Failed to handle file open request:", error.message)
    process.exit(1)
  })
}