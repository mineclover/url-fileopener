import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as FileSystem from "@effect/platform/FileSystem"
import { spawn } from "child_process"
import { promisify } from "util"

export interface FileOperations {
  readonly openFile: (filePath: string) => Effect.Effect<void, Error>
  readonly fileExists: (filePath: string) => Effect.Effect<boolean, Error>
}

export const FileOperations = Context.GenericTag<FileOperations>("FileOperations")

export const FileOperationsLive = FileOperations.of({
  openFile: (filePath: string) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem

      // Check if file exists first
      const exists = yield* fs.exists(filePath)
      if (!exists) {
        yield* Effect.fail(new Error(`File not found: ${filePath}`))
      }

      // Determine the appropriate command based on platform
      const platform = process.platform
      let command: string
      let args: string[]

      switch (platform) {
        case "darwin": // macOS
          command = "open"
          args = [filePath]
          break
        case "win32": // Windows
          command = "start"
          args = ["", filePath] // Empty string is for the title
          break
        case "linux": // Linux
          command = "xdg-open"
          args = [filePath]
          break
        default:
          yield* Effect.fail(new Error(`Unsupported platform: ${platform}`))
          return
      }

      // Execute the command to open the file
      yield* Effect.tryPromise({
        try: () => new Promise<void>((resolve, reject) => {
          const child = spawn(command, args, {
            detached: true,
            stdio: "ignore"
          })

          child.on("error", (error) => {
            reject(new Error(`Failed to open file: ${error.message}`))
          })

          child.on("spawn", () => {
            child.unref() // Allow the parent process to exit
            resolve()
          })
        }),
        catch: (error) =>
          new Error(`Failed to open file: ${error instanceof Error ? error.message : String(error)}`)
      })
    }),

  fileExists: (filePath: string) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      return yield* fs.exists(filePath)
    })
})