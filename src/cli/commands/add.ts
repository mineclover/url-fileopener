import { Args, Command, Options } from "@effect/cli"
import { Effect } from "effect"
import { resolve } from "path"
import { ConfigManager } from "../../services/config-manager/index.js"
import { Logger } from "../../services/logging/index.js"
import { validateProjectAlias } from "../../services/file-opener/url-parser.js"
import { createSuccessResult, createErrorResult, type CommandResult } from "../../models/CommandResult.js"

const projectAliasArg = Args.text({ name: "projectAlias" }).pipe(
  Args.withDescription("Unique alias for the project")
)

const projectPathArg = Args.text({ name: "projectPath" }).pipe(
  Args.withDescription("Path to the project directory"),
  Args.optional
)

const forceFlag = Options.boolean("force").pipe(
  Options.withAlias("f"),
  Options.withDescription("Force overwrite existing project alias"),
  Options.withDefault(false)
)

const hereFlag = Options.boolean("here").pipe(
  Options.withDescription("Use current directory as project path"),
  Options.withDefault(false)
)

export const addHandler = ({ projectAlias, projectPath, force, here }: { projectAlias: string; projectPath?: string; force: boolean; here: boolean }) => Effect.gen(function* () {
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    try {
      // Validate project alias
      yield* validateProjectAlias(projectAlias)

      // Validate conflicting options
      if (here && projectPath) {
        return createErrorResult("Cannot use both --here flag and project path argument. Use either --here or specify a path.")
      }

      // Determine the path to use
      let targetPath: string
      if (here) {
        targetPath = process.cwd()
      } else {
        targetPath = projectPath || process.cwd()
      }

      const resolvedPath = resolve(targetPath)

      // Check if directory exists
      const pathValidation = yield* Effect.tryPromise(async () => {
        try {
          const fs = await import("fs/promises")
          const stat = await fs.stat(resolvedPath)
          return stat.isDirectory()
        } catch {
          throw new Error(`Path '${resolvedPath}' does not exist`)
        }
      })

      if (!pathValidation) {
        return createErrorResult(`Path '${resolvedPath}' is not a directory`)
      }

      yield* configManager.addProject(projectAlias, resolvedPath, force)

      const message = `Project '${projectAlias}' added successfully`

      yield* logger.info(message, {
        projectAlias,
        projectPath: resolvedPath,
        force,
        here
      })

      return createSuccessResult(message, {
        project: {
          alias: projectAlias,
          path: resolvedPath
        }
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      yield* logger.error(`Failed to add project: ${errorMessage}`, {
        projectAlias,
        projectPath: projectPath || process.cwd(),
        force,
        here,
        error: error instanceof Error ? error.stack : String(error)
      })

      return createErrorResult(errorMessage)
    }
  })

const _AddCommand = Command.make(
  "add",
  {
    projectAlias: projectAliasArg,
    projectPath: projectPathArg,
    force: forceFlag,
    here: hereFlag
  },
  addHandler
).pipe(
  Command.withDescription("Add a project alias for file opening")
)

// For testing compatibility
;(_AddCommand as any).handler = addHandler

export const AddCommand = _AddCommand