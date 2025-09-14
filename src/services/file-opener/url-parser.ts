import { Effect } from "effect"
import type { FileOpenRequest } from "../../models/FileOpenRequest.js"

export interface ParsedUrl {
  readonly projectAlias: string
  readonly filePath: string
  readonly lineNumber?: number
  readonly columnNumber?: number
}

export const parseFileOpenUrl = (url: string): Effect.Effect<FileOpenRequest, Error> =>
  Effect.gen(function* () {
    try {
      // Remove protocol prefix
      const withoutProtocol = url.replace(/^fileopener:\/\//, "")
      const decoded = decodeURIComponent(withoutProtocol)

      // Modern format: project/path/to/file:line:col
      // Legacy format: project/path/to/file
      const parts = decoded.split("/")

      if (parts.length < 2) {
        yield* Effect.fail(new Error("Invalid URL format: missing project alias or file path"))
      }

      const projectAlias = parts[0]
      const remainingPath = parts.slice(1).join("/")

      if (!projectAlias) {
        yield* Effect.fail(new Error("Invalid URL format: empty project alias"))
      }

      // Check for line:column notation at the end
      const lineColMatch = remainingPath.match(/^(.*):(\d+)(?::(\d+))?$/)

      if (lineColMatch) {
        const [, filePath, line, col] = lineColMatch
        return {
          projectAlias,
          filePath,
          lineNumber: parseInt(line, 10),
          columnNumber: col ? parseInt(col, 10) : undefined,
          originalUrl: url
        }
      } else {
        return {
          projectAlias,
          filePath: remainingPath,
          originalUrl: url
        }
      }
    } catch (error) {
      yield* Effect.fail(new Error(`Failed to parse URL: ${error instanceof Error ? error.message : String(error)}`))
    }
  })

export const validateProjectAlias = (alias: string): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    if (!alias || alias.trim().length === 0) {
      yield* Effect.fail(new Error("Project alias cannot be empty"))
    }

    // Check for invalid characters
    if (!/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(alias)) {
      yield* Effect.fail(new Error("Project alias must start with alphanumeric character and contain only letters, numbers, dots, underscores, and hyphens"))
    }

    // Check for reserved names
    const reserved = ["config", "help", "version", "install", "uninstall", "add", "remove", "list"]
    if (reserved.includes(alias.toLowerCase())) {
      yield* Effect.fail(new Error(`Project alias '${alias}' is reserved and cannot be used`))
    }
  })