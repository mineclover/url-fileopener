import { Effect, Context, Layer } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import type { FileOpenRequest } from "../../models/FileOpenRequest.js"
import type { ProjectConfig } from "../../models/ProjectConfig.js"
import { parseFileOpenUrl } from "./url-parser.js"
import { resolveFilePath, type ResolvedFileRequest } from "./path-resolver.js"
import { ConfigManager } from "../config-manager/index.js"

export interface FileOpener {
  readonly parseAndResolve: (url: string) => Effect.Effect<ResolvedFileRequest, Error>
  readonly openFile: (resolved: ResolvedFileRequest) => Effect.Effect<void, Error>
}

export const FileOpener = Context.GenericTag<FileOpener>("FileOpener")

export const FileOpenerLive = Layer.effect(
  FileOpener,
  Effect.gen(function* () {
    const configManager = yield* ConfigManager

    const parseAndResolve = (url: string) => Effect.gen(function* () {
      // Parse the URL
      const request = yield* parseFileOpenUrl(url)

      // Load project configuration
      const config = yield* configManager.load

      // Find the project path
      const projectPath = config[request.projectAlias]
      if (!projectPath) {
        yield* Effect.fail(new Error(`Project alias '${request.projectAlias}' not found in configuration`))
      }

      // Resolve the file path with security validation
      return yield* resolveFilePath(projectPath, request)
    })

    const openFile = (resolved: ResolvedFileRequest) => Effect.gen(function* () {
      // For now, just log the file that would be opened
      // In a real implementation, this would interact with the system to open the file
      console.log(`Opening file: ${resolved.absolutePath}`)
      if (resolved.request.lineNumber) {
        console.log(`  Line: ${resolved.request.lineNumber}`)
      }
      if (resolved.request.columnNumber) {
        console.log(`  Column: ${resolved.request.columnNumber}`)
      }

      if (!resolved.exists) {
        console.log(`  Note: File does not exist yet - editor may create it`)
      }
    })

    return {
      parseAndResolve,
      openFile
    }
  })
)

export const FileOpenerNode = FileOpenerLive.pipe(
  Layer.provide(NodeFileSystem.layer)
)