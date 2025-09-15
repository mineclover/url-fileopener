import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import { protocol } from "protocol-registry"
import type { CommandResult } from "../../models/CommandResult.js"
import { createSuccessResult, createErrorResult } from "../../models/CommandResult.js"

export interface ProtocolHandler {
  readonly register: () => Effect.Effect<CommandResult, Error>
  readonly unregister: () => Effect.Effect<CommandResult, Error>
  readonly isRegistered: () => Effect.Effect<boolean, Error>
}

export const ProtocolHandler = Context.GenericTag<ProtocolHandler>("ProtocolHandler")

export const ProtocolHandlerLive = ProtocolHandler.of({
  register: () =>
    Effect.tryPromise({
      try: async () => {
        const handlerPath = process.execPath
        const args = [require.resolve("../../bin/fopen-handler.js")]

        await protocol.register({
          protocol: "fileopener",
          command: handlerPath,
          args: args,
          override: true,
          terminal: false
        })

        return createSuccessResult(
          "register",
          "Protocol registered successfully",
          { protocol: "fileopener" }
        )
      },
      catch: (error) =>
        new Error(`Failed to register protocol: ${error instanceof Error ? error.message : String(error)}`)
    }),

  unregister: () =>
    Effect.tryPromise({
      try: async () => {
        await protocol.unregister({
          protocol: "fileopener"
        })

        return createSuccessResult(
          "unregister",
          "Protocol unregistered successfully",
          { protocol: "fileopener" }
        )
      },
      catch: (error) =>
        new Error(`Failed to unregister protocol: ${error instanceof Error ? error.message : String(error)}`)
    }),

  isRegistered: () =>
    Effect.tryPromise({
      try: async () => {
        const registered = await protocol.checkIfRegistered("fileopener")
        return registered
      },
      catch: (error) =>
        new Error(`Failed to check protocol registration: ${error instanceof Error ? error.message : String(error)}`)
    })
})