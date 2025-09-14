import { Args, Command, Options } from "@effect/cli"
import { Effect } from "effect"
import { ConfigManager } from "../../services/config-manager/index.js"
import { Logger } from "../../services/logging/index.js"
import { createSuccessResult, createErrorResult, type CommandResult } from "../../models/CommandResult.js"

const projectAliasArg = Args.text({ name: "projectAlias" }).pipe(
  Args.withDescription("Project alias to remove")
)

const forceFlag = Options.boolean("force").pipe(
  Options.withAlias("f"),
  Options.withDescription("Skip confirmation prompt"),
  Options.withDefault(false)
)

export const removeHandler = ({ projectAlias, force }: { projectAlias: string; force: boolean }) => Effect.gen(function* () {
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    try {
      if (!projectAlias || projectAlias.trim().length === 0) {
        return createErrorResult("Project alias is required")
      }

      const removed = yield* configManager.removeProject(projectAlias)

      if (!removed) {
        const message = `Project '${projectAlias}' not found`
        yield* logger.warn(message, { projectAlias })

        return createSuccessResult(message, {
          removed: null
        })
      }

      const message = `Project '${projectAlias}' removed successfully`

      yield* logger.info(message, {
        projectAlias,
        removedPath: removed.path,
        force
      })

      return createSuccessResult(message, {
        removed: {
          alias: removed.alias,
          path: removed.path
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      yield* logger.error(`Failed to remove project: ${errorMessage}`, {
        projectAlias,
        force,
        error: error instanceof Error ? error.stack : String(error)
      })

      return createErrorResult(`Configuration file not writable: ${errorMessage}`)
    }
  })

const _RemoveCommand = Command.make(
  "remove",
  {
    projectAlias: projectAliasArg,
    force: forceFlag
  },
  removeHandler
).pipe(
  Command.withDescription("Remove a project alias")
)

// For testing compatibility
;(_RemoveCommand as any).handler = removeHandler

export const RemoveCommand = _RemoveCommand