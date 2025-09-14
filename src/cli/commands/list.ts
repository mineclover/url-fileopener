import { Command, Options } from "@effect/cli"
import { Effect } from "effect"
import { ConfigManager } from "../../services/config-manager/index.js"
import { Logger } from "../../services/logging/index.js"
import { createSuccessResult, createErrorResult, type CommandResult } from "../../models/CommandResult.js"

const jsonFlag = Options.boolean("json").pipe(
  Options.withDescription("Output in JSON format"),
  Options.withDefault(false)
)

const pathsOnlyFlag = Options.boolean("paths-only").pipe(
  Options.withDescription("Output only project paths"),
  Options.withDefault(false)
)

const aliasesOnlyFlag = Options.boolean("aliases-only").pipe(
  Options.withDescription("Output only project aliases"),
  Options.withDefault(false)
)

export const listHandler = ({ json, pathsOnly, aliasesOnly }: { json: boolean; pathsOnly: boolean; aliasesOnly: boolean }) => Effect.gen(function* () {
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    try {
      const projects = yield* configManager.listProjects

      if (projects.length === 0) {
        const message = "No projects configured"
        yield* logger.info(message)

        return createSuccessResult(message, {
          projects: [],
          count: 0
        })
      }

      let data: any = {
        projects,
        count: projects.length
      }

      // Handle specific output formats
      if (pathsOnly) {
        data = {
          paths: projects.map(p => p.path),
          count: projects.length
        }
      } else if (aliasesOnly) {
        data = {
          aliases: projects.map(p => p.alias),
          count: projects.length
        }
      }

      const message = `Found ${projects.length} configured project${projects.length === 1 ? "" : "s"}`

      yield* logger.info(message, { count: projects.length })

      return createSuccessResult(message, data)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      yield* logger.error(`Failed to list projects: ${errorMessage}`, {
        json,
        pathsOnly,
        aliasesOnly,
        error: error instanceof Error ? error.stack : String(error)
      })

      return createErrorResult(`Configuration file error: ${errorMessage}`)
    }
  })

const _ListCommand = Command.make(
  "list",
  {
    json: jsonFlag,
    pathsOnly: pathsOnlyFlag,
    aliasesOnly: aliasesOnlyFlag
  },
  listHandler
).pipe(
  Command.withDescription("List all configured project aliases")
)

// For testing compatibility
;(_ListCommand as any).handler = listHandler

export const ListCommand = _ListCommand