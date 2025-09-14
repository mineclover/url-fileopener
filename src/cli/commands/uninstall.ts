import { Command, Options } from "@effect/cli"
import { Effect } from "effect"
import { ProtocolHandler } from "../../services/protocol-handler/index.js"
import { ConfigManager } from "../../services/config-manager/index.js"
import { Logger } from "../../services/logging/index.js"
import { createSuccessResult, createErrorResult, type CommandResult } from "../../models/CommandResult.js"

const forceFlag = Options.boolean("force").pipe(
  Options.withAlias("f"),
  Options.withDescription("Skip confirmation prompt"),
  Options.withDefault(false)
)

const keepConfigFlag = Options.boolean("keep-config").pipe(
  Options.withDescription("Keep configuration files when uninstalling"),
  Options.withDefault(false)
)

export const uninstallHandler = ({ force, keepConfig }: { force: boolean; keepConfig: boolean }) => Effect.gen(function* () {
    const protocolHandler = yield* ProtocolHandler
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    try {
      const wasRegistered = yield* protocolHandler.isRegistered

      if (!wasRegistered) {
        const message = "Protocol not currently registered"
        yield* logger.warn(message)

        return createErrorResult(message, {
          protocol: "fileopener",
          unregistered: false,
          configRemoved: false
        })
      }

      // Unregister the protocol
      yield* protocolHandler.unregister()

      let configRemoved = false
      let configError: string | undefined

      if (!keepConfig) {
        try {
          // Remove configuration files by saving an empty config
          yield* configManager.save({})
          configRemoved = true
        } catch (error) {
          configError = error instanceof Error ? error.message : String(error)
          yield* logger.warn(`Could not remove configuration files: ${configError}`)
        }
      }

      const message = configError
        ? "Protocol unregistered, but configuration files could not be removed"
        : keepConfig
          ? "Protocol 'fileopener://' unregistered successfully (configuration kept)"
          : "Protocol 'fileopener://' unregistered successfully"

      yield* logger.info(message, {
        force,
        keepConfig,
        configRemoved,
        configError
      })

      return createSuccessResult(message, {
        protocol: "fileopener",
        unregistered: true,
        configRemoved
      })
    } catch (error) {
      const errorMessage = `Failed to unregister protocol: ${error instanceof Error ? error.message : String(error)}`

      yield* logger.error(errorMessage, {
        force,
        keepConfig,
        error: error instanceof Error ? error.stack : String(error)
      })

      if (error instanceof Error && error.message.includes("Permission denied")) {
        return createErrorResult("Permission denied - try running as administrator")
      }

      return createErrorResult(errorMessage, {
        protocol: "fileopener",
        unregistered: false,
        configRemoved: false
      })
    }
  })

const _UninstallCommand = Command.make(
  "uninstall",
  {
    force: forceFlag,
    keepConfig: keepConfigFlag
  },
  uninstallHandler
).pipe(
  Command.withDescription("Unregister the fileopener:// protocol from the system")
)

// For testing compatibility
;(_UninstallCommand as any).handler = uninstallHandler

export const UninstallCommand = _UninstallCommand