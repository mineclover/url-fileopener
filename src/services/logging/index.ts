import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as FileSystem from "@effect/platform/FileSystem"
import { join } from "path"
import { homedir } from "os"
import type { LogEntry, LogLevel } from "../../models/LogEntry.js"
import { createLogEntry } from "../../models/LogEntry.js"

export interface Logger {
  readonly log: (level: LogLevel, message: string, source: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
  readonly info: (message: string, source: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
  readonly warn: (message: string, source: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
  readonly error: (message: string, source: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
  readonly debug: (message: string, source: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
}

export const Logger = Context.GenericTag<Logger>("Logger")

const LOG_DIR = join(homedir(), ".protocol-registry")
const LOG_FILE = join(LOG_DIR, "log.txt")

const formatLogEntry = (entry: LogEntry): string => {
  const contextStr = entry.context ? ` | ${JSON.stringify(entry.context)}` : ""
  return `[${entry.timestamp}] ${entry.level.toUpperCase()} [${entry.source}] ${entry.message}${contextStr}`
}

export const LoggerLive = Logger.of({
  log: (level: LogLevel, message: string, source: string, context?: Record<string, unknown>) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem

      // Ensure log directory exists
      const logDirExists = yield* fs.exists(LOG_DIR)
      if (!logDirExists) {
        yield* fs.makeDirectory(LOG_DIR, { recursive: true })
      }

      const entry = createLogEntry(level, message, source, context)
      const logLine = formatLogEntry(entry) + "\n"

      // Append to log file
      yield* fs.appendFileString(LOG_FILE, logLine)

      // Also log to console for development
      console.log(logLine.trim())
    }).pipe(
      Effect.catchAll((error) =>
        Effect.fail(new Error(`Failed to write log: ${error instanceof Error ? error.message : String(error)}`))
      )
    ),

  info: (message: string, source: string, context?: Record<string, unknown>) =>
    Logger.log("info", message, source, context),

  warn: (message: string, source: string, context?: Record<string, unknown>) =>
    Logger.log("warn", message, source, context),

  error: (message: string, source: string, context?: Record<string, unknown>) =>
    Logger.log("error", message, source, context),

  debug: (message: string, source: string, context?: Record<string, unknown>) =>
    Logger.log("debug", message, source, context)
})