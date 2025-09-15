import * as Options from "@effect/cli/Options"
import * as Command from "@effect/cli/Command"
import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import * as FileSystem from "@effect/platform/FileSystem"
import { join } from "path"
import { homedir } from "os"
import { ProtocolHandler, ProtocolHandlerLive } from "../../services/protocol-handler/index.js"
import { Logger, LoggerLive } from "../../services/logging/index.js"

const cleanOption = Options.boolean("clean").pipe(
  Options.withAlias("c"),
  Options.withDescription("Clean up configuration files")
)

export const uninstallCommand = Command.make("uninstall", {
  options: cleanOption
}, ({ options: clean }) =>
  Effect.gen(function* () {
    const protocolHandler = yield* ProtocolHandler
    const logger = yield* Logger
    const fs = yield* FileSystem.FileSystem

    yield* logger.info("Starting protocol uninstallation", "uninstall-command", { clean })

    try {
      // Check if protocol is registered
      const isRegistered = yield* protocolHandler.isRegistered()

      if (isRegistered) {
        // Unregister protocol
        const result = yield* protocolHandler.unregister()

        if (result.success) {
          yield* Console.log(result.message)
          yield* logger.info("Protocol unregistered successfully", "uninstall-command")
        } else {
          yield* Console.log(result.error || "Unregistration failed")
          yield* logger.error("Protocol unregistration failed", "uninstall-command", { error: result.error })
        }
      } else {
        yield* Console.log("Protocol not currently registered")
        yield* logger.info("Protocol was not registered", "uninstall-command")
      }

      // Clean up configuration files if requested
      if (clean) {
        const configDir = join(homedir(), ".protocol-registry")
        const configExists = yield* fs.exists(configDir)

        if (configExists) {
          yield* fs.remove(configDir)
          yield* Console.log("Configuration files cleaned up")
          yield* logger.info("Configuration files cleaned up", "uninstall-command")
        } else {
          yield* Console.log("No configuration files found to clean up")
        }
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      yield* Console.log(`Uninstallation failed: ${errorMessage}`)
      yield* logger.error("Uninstallation failed", "uninstall-command", { error: errorMessage })
    }
  }).pipe(
    Effect.provide(ProtocolHandlerLive),
    Effect.provide(LoggerLive)
  )
)