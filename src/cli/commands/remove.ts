import * as Args from "@effect/cli/Args"
import * as Command from "@effect/cli/Command"
import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import { ConfigManager, ConfigManagerLive } from "../../services/config-manager/index.js"
import { Logger, LoggerLive } from "../../services/logging/index.js"

const projectNameArg = Args.text({ name: "project" })

export const removeCommand = Command.make("remove", {
  args: projectNameArg
}, ({ args: projectName }) =>
  Effect.gen(function* () {
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    yield* logger.info("Removing project", "remove-command", { project: projectName })

    try {
      const removed = yield* configManager.removeProject(projectName)

      if (removed) {
        const message = `Project '${projectName}' removed successfully`
        yield* Console.log(message)
        yield* logger.info("Project removed successfully", "remove-command", { project: projectName })
      } else {
        const message = `Project '${projectName}' not found`
        yield* Console.log(message)
        yield* logger.warn("Project not found for removal", "remove-command", { project: projectName })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      yield* Console.log(`Failed to remove project: ${errorMessage}`)
      yield* logger.error("Failed to remove project", "remove-command", {
        project: projectName,
        error: errorMessage
      })
    }
  }).pipe(
    Effect.provide(ConfigManagerLive),
    Effect.provide(LoggerLive)
  )
)