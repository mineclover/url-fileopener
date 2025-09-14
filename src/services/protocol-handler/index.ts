import { Effect, Context, Layer } from "effect"
import protocolRegistry from "protocol-registry"
const { register, deRegister, checkIfExists } = protocolRegistry

export interface ProtocolHandler {
  readonly register: (override?: boolean) => Effect.Effect<void, Error>
  readonly unregister: Effect.Effect<void, Error>
  readonly isRegistered: Effect.Effect<boolean, Error>
}

export const ProtocolHandler = Context.GenericTag<ProtocolHandler>("ProtocolHandler")

const PROTOCOL = "fileopener"

export const ProtocolHandlerLive = Layer.succeed(
  ProtocolHandler,
  {
    register: (override = false) => Effect.gen(function* () {
      const isAlreadyRegistered = yield* Effect.tryPromise(() => checkIfExists(PROTOCOL))

      if (isAlreadyRegistered && !override) {
        // Already registered, no need to register again
        return
      }

      // Get the path to the handler binary
      const handlerPath = process.argv[0] // Node.js executable
      const scriptPath = new URL("../../bin/url-handler.js", import.meta.url).pathname
      const commandString = `"${handlerPath}" "${scriptPath}" "%1"`

      yield* Effect.tryPromise(() =>
        register(PROTOCOL, {
          command: commandString,
          terminal: false,
          override
        })
      )
    }),

    unregister: Effect.gen(function* () {
      yield* Effect.tryPromise(() => deRegister(PROTOCOL))
    }),

    isRegistered: Effect.gen(function* () {
      return yield* Effect.tryPromise(() => checkIfExists(PROTOCOL))
    })
  }
)