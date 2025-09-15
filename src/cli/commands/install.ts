import * as CliApp from "@effect/cli/CliApp"
import * as Command from "@effect/cli/Command"
import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import { ProtocolHandler, ProtocolHandlerLive } from "../../services/protocol-handler/index.js"
import { ConfigManager, ConfigManagerLive } from "../../services/config-manager/index.js"
import { Logger, LoggerLive } from "../../services/logging/index.js"

export const installCommand = Command.make("install", {}, () =>
  Effect.gen(function* () {
    const protocolHandler = yield* ProtocolHandler
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    yield* logger.info("Starting protocol installation", "install-command")

    try {
      // Initialize configuration
      yield* configManager.getConfig()
      yield* Console.log("Configuration directory created")

      // Register protocol
      const result = yield* protocolHandler.register()

      if (result.success) {
        yield* Console.log(result.message)
        yield* logger.info("Protocol registered successfully", "install-command", { protocol: "fileopener" })
      } else {
        yield* Console.log(result.error || "Registration failed")
        yield* logger.error("Protocol registration failed", "install-command", { error: result.error })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      yield* Console.log(`Installation failed: ${errorMessage}`)
      yield* logger.error("Installation failed", "install-command", { error: errorMessage })
    }
  }).pipe(
    Effect.provide(ProtocolHandlerLive),
    Effect.provide(ConfigManagerLive),
    Effect.provide(LoggerLive)
  )
)