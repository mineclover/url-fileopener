import * as Schema from "effect/Schema"

export const FileOpenRequest = Schema.Struct({
  url: Schema.String,
  project: Schema.String,
  filePath: Schema.String,
  resolvedPath: Schema.optional(Schema.String),
  timestamp: Schema.String
})

export type FileOpenRequest = Schema.Schema.Type<typeof FileOpenRequest>

export const createFileOpenRequest = (
  url: string,
  project: string,
  filePath: string,
  resolvedPath?: string
): FileOpenRequest => ({
  url,
  project,
  filePath,
  resolvedPath,
  timestamp: new Date().toISOString()
})