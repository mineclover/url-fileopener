#!/usr/bin/env node

import * as Effect from "effect/Effect"
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import { UrlParser, UrlParserLive } from "../services/file-opener/url-parser.js"
import { PathResolver, PathResolverLive } from "../services/file-opener/path-resolver.js"
import { FileOperations, FileOperationsLive } from "../services/file-opener/file-operations.js"
import { ConfigManager, ConfigManagerLive } from "../services/config-manager/index.js"
import { Logger, LoggerLive } from "../services/logging/index.js"

const handleFileOpenRequest = (url: string) =>
  Effect.gen(function* () {
    const urlParser = yield* UrlParser
    const pathResolver = yield* PathResolver
    const fileOperations = yield* FileOperations
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    yield* logger.info("Processing file open request", "fopen-handler", { url })

    try {
      // Parse the URL
      const fileRequest = yield* urlParser.parseUrl(url)
      yield* logger.debug("URL parsed successfully", "fopen-handler", {
        project: fileRequest.project,
        filePath: fileRequest.filePath
      })

      // Get project path from configuration
      const projectPath = yield* configManager.getProjectPath(fileRequest.project)
      if (!projectPath) {
        yield* logger.error("Project not found", "fopen-handler", { project: fileRequest.project })
        console.error(`Project '${fileRequest.project}' not found in configuration`)
        process.exit(1)
      }

      // Resolve and validate the file path
      const resolvedPath = yield* pathResolver.resolvePath(projectPath, fileRequest.filePath)
      yield* logger.debug("Path resolved", "fopen-handler", { resolvedPath })

      // Check if file exists
      const exists = yield* fileOperations.fileExists(resolvedPath)
      if (!exists) {
        yield* logger.error("File not found", "fopen-handler", { path: resolvedPath })
        console.error(`File not found: ${resolvedPath}`)
        process.exit(1)
      }

      // Open the file
      yield* fileOperations.openFile(resolvedPath)
      yield* logger.info("File opened successfully", "fopen-handler", { path: resolvedPath })
      console.log("File opened successfully")

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      yield* logger.error("Failed to open file", "fopen-handler", { url, error: errorMessage })
      console.error(`Failed to open file: ${errorMessage}`)
      process.exit(1)
    }
  }).pipe(
    Effect.provide(UrlParserLive),
    Effect.provide(PathResolverLive),
    Effect.provide(FileOperationsLive),
    Effect.provide(ConfigManagerLive),
    Effect.provide(LoggerLive),
    Effect.provide(NodeContext.layer)
  )

// Get URL from command line arguments
const url = process.argv[2]

if (!url) {
  console.error("Usage: fopen-handler <fileopener://url>")
  process.exit(1)
}

// Run the handler
handleFileOpenRequest(url).pipe(
  NodeRuntime.runMain({ disableErrorReporting: true })
)