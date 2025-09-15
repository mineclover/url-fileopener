import * as Args from "@effect/cli/Args"
import * as Command from "@effect/cli/Command"
import * as Effect from "effect/Effect"
import * as Console from "effect/Console"
import { ConfigManager, ConfigManagerLive } from "../../services/config-manager/index.js"
import { Logger, LoggerLive } from "../../services/logging/index.js"

const projectNameArg = Args.text({ name: "project" })
const projectPathArg = Args.text({ name: "path" })

export const addCommand = Command.make("add", {
  args: Args.all([projectNameArg, projectPathArg])
}, ({ args: [projectName, projectPath] }) =>
  Effect.gen(function* () {
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    yield* logger.info("Adding project", "add-command", { project: projectName, path: projectPath })

    try {
      yield* configManager.addProject(projectName, projectPath)
      const message = `Project '${projectName}' added successfully`
      yield* Console.log(message)
      yield* logger.info("Project added successfully", "add-command", { project: projectName, path: projectPath })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      if (errorMessage.includes("Path does not exist")) {
        yield* Console.log("Path does not exist")
      } else {
        yield* Console.log(`Failed to add project: ${errorMessage}`)
      }

      yield* logger.error("Failed to add project", "add-command", {
        project: projectName,
        path: projectPath,
        error: errorMessage
      })
    }
  }).pipe(
    Effect.provide(ConfigManagerLive),
    Effect.provide(LoggerLive)
  )
)