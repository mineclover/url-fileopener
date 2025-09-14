import { Effect } from "effect"
import { resolve, normalize, sep, isAbsolute } from "path"
import type { FileOpenRequest } from "../../models/FileOpenRequest.js"

export interface ResolvedFileRequest {
  readonly absolutePath: string
  readonly exists: boolean
  readonly request: FileOpenRequest
}

export const validatePathSecurity = (projectBasePath: string, requestedPath: string): Effect.Effect<void, Error> =>
  Effect.gen(function* () {
    // Resolve both paths to absolute paths
    const resolvedBasePath = resolve(projectBasePath)
    const resolvedRequestPath = resolve(projectBasePath, requestedPath)

    // Check if the resolved path is within the project directory
    const normalizedBasePath = normalize(resolvedBasePath)
    const normalizedRequestPath = normalize(resolvedRequestPath)

    // Ensure the resolved path starts with the base path
    if (!normalizedRequestPath.startsWith(normalizedBasePath + sep) && normalizedRequestPath !== normalizedBasePath) {
      yield* Effect.fail(new Error("Path traversal attempt detected: requested path is outside project directory"))
    }
  })

export const resolveFilePath = (
  projectBasePath: string,
  request: FileOpenRequest
): Effect.Effect<ResolvedFileRequest, Error> =>
  Effect.gen(function* () {
    // Validate security first
    yield* validatePathSecurity(projectBasePath, request.filePath)

    // Resolve to absolute path
    const absolutePath = resolve(projectBasePath, request.filePath)

    // Check if file exists (but don't fail if it doesn't - editor might create it)
    const exists = yield* Effect.tryPromise(async () => {
      try {
        const fs = await import("fs/promises")
        await fs.access(absolutePath)
        return true
      } catch {
        return false
      }
    })

    return {
      absolutePath,
      exists,
      request
    }
  })