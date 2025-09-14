import { Schema } from "effect"

export interface FileOpenRequest {
  readonly projectAlias: string
  readonly filePath: string
  readonly lineNumber?: number
  readonly columnNumber?: number
  readonly originalUrl: string
}

export const FileOpenRequestSchema = Schema.Struct({
  projectAlias: Schema.String,
  filePath: Schema.String,
  lineNumber: Schema.optional(Schema.Number),
  columnNumber: Schema.optional(Schema.Number),
  originalUrl: Schema.String
})