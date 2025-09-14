import { Effect, Context, Layer } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { join } from "path"
import { homedir } from "os"
import type { LogEntry, LogLevel } from "../../models/LogEntry.js"
import { createLogEntry } from "../../models/LogEntry.js"

export interface Logger {
  readonly info: (message: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
  readonly warn: (message: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
  readonly error: (message: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
  readonly debug: (message: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
  readonly log: (level: LogLevel, message: string, context?: Record<string, unknown>) => Effect.Effect<void, Error>
}

export const Logger = Context.GenericTag<Logger>("Logger")

const DEFAULT_LOG_DIR = join(homedir(), ".protocol-registry")
const LOG_FILE = "log.txt"

export const LoggerLive = Layer.effect(
  Logger,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const getLogPath = Effect.succeed(join(DEFAULT_LOG_DIR, LOG_FILE))

    const ensureLogDir = Effect.gen(function* () {
      yield* fs.makeDirectory(DEFAULT_LOG_DIR, { recursive: true })
    }).pipe(Effect.orDie)

    const writeLog = (entry: LogEntry) => Effect.gen(function* () {
      yield* ensureLogDir
      const logPath = yield* getLogPath

      const timestamp = entry.timestamp.toISOString()
      const level = entry.level.toUpperCase().padEnd(5)
      const contextStr = entry.context ? ` ${JSON.stringify(entry.context)}` : ""
      const logLine = `[${timestamp}] ${level} ${entry.message}${contextStr}\n`

      // Read existing content and append the new line
      const existingContent = yield* Effect.orElse(
        fs.readFileString(logPath),
        () => Effect.succeed("")
      )
      const newContent = existingContent + logLine
      yield* fs.writeFileString(logPath, newContent)
    })

    const log = (level: LogLevel, message: string, context?: Record<string, unknown>) => Effect.gen(function* () {
      const entry = createLogEntry(level, message, context)
      yield* writeLog(entry)

      // Also log to console in development
      if (process.env.NODE_ENV !== "production") {
        const consoleMethod = level === "error" ? "error" : level === "warn" ? "warn" : "log"
        console[consoleMethod](`[${level.toUpperCase()}] ${message}`, context || "")
      }
    })

    const info = (message: string, context?: Record<string, unknown>) => log("info", message, context)
    const warn = (message: string, context?: Record<string, unknown>) => log("warn", message, context)
    const error = (message: string, context?: Record<string, unknown>) => log("error", message, context)
    const debug = (message: string, context?: Record<string, unknown>) => log("debug", message, context)

    return {
      info,
      warn,
      error,
      debug,
      log
    }
  })
)

export const LoggerNode = LoggerLive.pipe(
  Layer.provide(NodeFileSystem.layer)
)