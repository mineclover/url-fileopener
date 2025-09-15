import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as FileSystem from "@effect/platform/FileSystem"
import { join, resolve, relative, normalize } from "path"

export interface PathResolver {
  readonly resolvePath: (projectPath: string, filePath: string) => Effect.Effect<string, Error>
  readonly validatePath: (projectPath: string, filePath: string) => Effect.Effect<string, Error>
}

export const PathResolver = Context.GenericTag<PathResolver>("PathResolver")

export const PathResolverLive = PathResolver.of({
  resolvePath: (projectPath: string, filePath: string) =>
    Effect.gen(function* () {
      // Security validation: prevent path traversal
      const validatedPath = yield* PathResolver.validatePath(projectPath, filePath)
      return validatedPath
    }),

  validatePath: (projectPath: string, filePath: string) =>
    Effect.gen(function* () {
      // Normalize and resolve paths
      const normalizedProjectPath = resolve(projectPath)
      const normalizedFilePath = normalize(filePath)

      // Check for absolute paths (not allowed for security)
      if (normalizedFilePath.startsWith("/") || /^[A-Za-z]:/.test(normalizedFilePath)) {
        yield* Effect.fail(new Error("Absolute paths not allowed"))
      }

      // Resolve the full file path
      const fullPath = resolve(join(normalizedProjectPath, normalizedFilePath))

      // Security check: ensure the resolved path is within the project directory
      const relativePath = relative(normalizedProjectPath, fullPath)
      if (relativePath.startsWith("..") || relativePath.includes("..")) {
        yield* Effect.fail(new Error("Path traversal detected"))
      }

      // Additional security check: verify the full path starts with project path
      if (!fullPath.startsWith(normalizedProjectPath)) {
        yield* Effect.fail(new Error("Path traversal detected"))
      }

      return fullPath
    })
})