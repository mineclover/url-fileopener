import * as Schema from "effect/Schema"

export const LogLevel = Schema.Literal("info", "warn", "error", "debug")
export type LogLevel = Schema.Schema.Type<typeof LogLevel>

export const LogEntry = Schema.Struct({
  level: LogLevel,
  message: Schema.String,
  context: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown
  })),
  timestamp: Schema.String,
  source: Schema.String
})

export type LogEntry = Schema.Schema.Type<typeof LogEntry>

export const createLogEntry = (
  level: LogLevel,
  message: string,
  source: string,
  context?: Record<string, unknown>
): LogEntry => ({
  level,
  message,
  context,
  timestamp: new Date().toISOString(),
  source
})