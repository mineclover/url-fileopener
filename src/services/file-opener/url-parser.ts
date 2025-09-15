import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import type { FileOpenRequest } from "../../models/FileOpenRequest.js"
import { createFileOpenRequest } from "../../models/FileOpenRequest.js"

export interface UrlParser {
  readonly parseUrl: (url: string) => Effect.Effect<FileOpenRequest, Error>
}

export const UrlParser = Context.GenericTag<UrlParser>("UrlParser")

export const UrlParserLive = UrlParser.of({
  parseUrl: (url: string) =>
    Effect.gen(function* () {
      try {
        const parsedUrl = new URL(url)

        if (parsedUrl.protocol !== "fileopener:") {
          yield* Effect.fail(new Error(`Invalid protocol: ${parsedUrl.protocol}. Expected 'fileopener:'`))
        }

        const project = parsedUrl.hostname || parsedUrl.host
        if (!project) {
          yield* Effect.fail(new Error("Project name is required in URL"))
        }

        let filePath: string

        // Check for legacy query parameter format
        const queryPath = parsedUrl.searchParams.get("path")
        if (queryPath) {
          // Legacy format: fileopener://project?path=file/path
          filePath = decodeURIComponent(queryPath)
        } else {
          // Modern format: fileopener://project/file/path
          filePath = parsedUrl.pathname.slice(1) // Remove leading slash
          if (!filePath) {
            yield* Effect.fail(new Error("File path is required in URL"))
          }
          filePath = decodeURIComponent(filePath)
        }

        return createFileOpenRequest(url, project, filePath)
      } catch (error) {
        yield* Effect.fail(new Error(`Failed to parse URL: ${error instanceof Error ? error.message : String(error)}`))
      }
    })
})