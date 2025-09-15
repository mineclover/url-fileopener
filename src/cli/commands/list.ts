import * as Command from "@effect/cli/Command"
import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import { ConfigManager, ConfigManagerLive } from "../../services/config-manager/index.js"
import { Logger, LoggerLive } from "../../services/logging/index.js"

export const listCommand = Command.make("list", {}, () =>
  Effect.gen(function* () {
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    yield* logger.info("Listing projects", "list-command")

    try {
      const projects = yield* configManager.listProjects()
      const projectCount = Object.keys(projects).length

      if (projectCount === 0) {
        yield* Console.log("No projects configured")
      } else {
        yield* Console.log("Configured projects:")
        for (const [name, path] of Object.entries(projects)) {
          yield* Console.log(`  ${name} -> ${path}`)
        }
      }

      yield* logger.info("Listed projects successfully", "list-command", { count: projectCount })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      yield* Console.log(`Failed to list projects: ${errorMessage}`)
      yield* logger.error("Failed to list projects", "list-command", { error: errorMessage })
    }
  }).pipe(
    Effect.provide(ConfigManagerLive),
    Effect.provide(LoggerLive)
  )
)