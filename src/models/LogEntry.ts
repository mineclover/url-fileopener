import { Schema } from "effect"

export type LogLevel = "info" | "warn" | "error" | "debug"

export interface LogEntry {
  readonly timestamp: Date
  readonly level: LogLevel
  readonly message: string
  readonly context?: Record<string, unknown>
}

export const LogLevelSchema = Schema.Union(
  Schema.Literal("info"),
  Schema.Literal("warn"),
  Schema.Literal("error"),
  Schema.Literal("debug")
)

export const LogEntrySchema = Schema.Struct({
  timestamp: Schema.Date,
  level: LogLevelSchema,
  message: Schema.String,
  context: Schema.optional(Schema.Record({
    key: Schema.String,
    value: Schema.Unknown
  }))
})

export const createLogEntry = (
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>
): LogEntry => ({
  timestamp: new Date(),
  level,
  message,
  context
})