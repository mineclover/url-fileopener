import * as Schema from "effect/Schema"

export const CommandResult = Schema.Struct({
  success: Schema.Boolean,
  message: Schema.String,
  command: Schema.String,
  data: Schema.optional(Schema.Unknown),
  error: Schema.optional(Schema.String),
  timestamp: Schema.String
})

export type CommandResult = Schema.Schema.Type<typeof CommandResult>

export const createSuccessResult = (
  command: string,
  message: string,
  data?: unknown
): CommandResult => ({
  success: true,
  message,
  command,
  data,
  timestamp: new Date().toISOString()
})

export const createErrorResult = (
  command: string,
  message: string,
  error?: string
): CommandResult => ({
  success: false,
  message,
  command,
  error,
  timestamp: new Date().toISOString()
})