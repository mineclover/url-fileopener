import { Args, Command, Options } from "@effect/cli"
import { Effect } from "effect"
import { ProtocolHandler } from "../../services/protocol-handler/index.js"
import { Logger } from "../../services/logging/index.js"
import { createSuccessResult, createErrorResult, type CommandResult } from "../../models/CommandResult.js"

const overrideFlag = Options.boolean("override").pipe(
  Options.withAlias("f"),
  Options.withDescription("Override existing protocol registration"),
  Options.withDefault(false)
)

const terminalFlag = Options.boolean("terminal").pipe(
  Options.withDescription("Show terminal window when opening files"),
  Options.withDefault(false)
)

// Export the handler function for testing
export const installHandler = ({ override, terminal }: { override: boolean; terminal: boolean }) => Effect.gen(function* () {
    const protocolHandler = yield* ProtocolHandler
    const logger = yield* Logger

    try {
      const wasAlreadyRegistered = yield* protocolHandler.isRegistered

      yield* protocolHandler.register(override)

      const message = wasAlreadyRegistered && !override
        ? "Protocol 'fileopener://' already registered"
        : "Protocol 'fileopener://' registered successfully"

      yield* logger.info(message, {
        override,
        terminal,
        wasAlreadyRegistered
      })

      return createSuccessResult(message, {
        protocol: "fileopener",
        registered: true,
        wasAlreadyRegistered
      })
    } catch (error) {
      const errorMessage = `Failed to register protocol: ${error instanceof Error ? error.message : String(error)}`

      yield* logger.error(errorMessage, {
        override,
        terminal,
        error: error instanceof Error ? error.stack : String(error)
      })

      return createErrorResult(errorMessage, {
        protocol: "fileopener",
        registered: false
      })
    }
  })

const _InstallCommand = Command.make(
  "install",
  {
    override: overrideFlag,
    terminal: terminalFlag
  },
  installHandler
).pipe(
  Command.withDescription("Register the fileopener:// protocol with the system")
)

// For testing compatibility - ensure handler is attached to the command
;(_InstallCommand as any).handler = installHandler

export const InstallCommand = _InstallCommand