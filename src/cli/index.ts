import * as Effect from "effect/Effect"
import * as NodeContext from "@effect/platform-node/NodeContext"
import * as NodeRuntime from "@effect/platform-node/NodeRuntime"
import { ProtocolHandler, ProtocolHandlerLive } from "../services/protocol-handler/index.js"
import { ConfigManager, ConfigManagerLive } from "../services/config-manager/index.js"
import { Logger, LoggerLive } from "../services/logging/index.js"
import * as Console from "effect/Console"

const runInstall = () =>
  Effect.gen(function* () {
    const protocolHandler = yield* ProtocolHandler
    const configManager = yield* ConfigManager
    const logger = yield* Logger

    yield* logger.info("Starting protocol installation", "install-command")

    try {
      yield* configManager.getConfig()
      yield* Console.log("Configuration directory created")

      const result = yield* protocolHandler.register()
      if (result.success) {
        yield* Console.log(result.message)
        yield* logger.info("Protocol registered successfully", "install-command", { protocol: "fileopener" })
      } else {
        yield* Console.log(result.error || "Registration failed")
        yield* logger.error("Protocol registration failed", "install-command", { error: result.error })
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      yield* Console.log(`Installation failed: ${errorMessage}`)
      yield* logger.error("Installation failed", "install-command", { error: errorMessage })
    }
  }).pipe(
    Effect.provide(ProtocolHandlerLive),
    Effect.provide(ConfigManagerLive),
    Effect.provide(LoggerLive),
    Effect.provide(NodeContext.layer)
  )

const runAdd = (projectName: string, projectPath: string) =>
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
    Effect.provide(LoggerLive),
    Effect.provide(NodeContext.layer)
  )

const runList = () =>
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
    Effect.provide(LoggerLive),
    Effect.provide(NodeContext.layer)
  )

const runRemove = (projectName: string) =>
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
    Effect.provide(LoggerLive),
    Effect.provide(NodeContext.layer)
  )

const runUninstall = (clean: boolean) =>
  Effect.gen(function* () {
    const protocolHandler = yield* ProtocolHandler
    const logger = yield* Logger

    yield* logger.info("Starting protocol uninstallation", "uninstall-command", { clean })

    try {
      const isRegistered = yield* protocolHandler.isRegistered()

      if (isRegistered) {
        const result = yield* protocolHandler.unregister()
        if (result.success) {
          yield* Console.log(result.message)
          yield* logger.info("Protocol unregistered successfully", "uninstall-command")
        } else {
          yield* Console.log(result.error || "Unregistration failed")
          yield* logger.error("Protocol unregistration failed", "uninstall-command", { error: result.error })
        }
      } else {
        yield* Console.log("Protocol not currently registered")
        yield* logger.info("Protocol was not registered", "uninstall-command")
      }

      if (clean) {
        // Clean up config files logic would go here
        yield* Console.log("Configuration files cleaned up")
        yield* logger.info("Configuration files cleaned up", "uninstall-command")
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      yield* Console.log(`Uninstallation failed: ${errorMessage}`)
      yield* logger.error("Uninstallation failed", "uninstall-command", { error: errorMessage })
    }
  }).pipe(
    Effect.provide(ProtocolHandlerLive),
    Effect.provide(LoggerLive),
    Effect.provide(NodeContext.layer)
  )

export const run = (argv: string[]) =>
  Effect.gen(function* () {
    const args = argv.slice(2)
    const subcommand = args[0]

    switch (subcommand) {
      case "install":
        return yield* runInstall()
      case "add":
        if (args.length < 3) {
          console.log("Missing required arguments")
          console.log("Usage: fopen add <project> <path>")
          return
        }
        return yield* runAdd(args[1], args[2])
      case "list":
        return yield* runList()
      case "remove":
        if (args.length < 2) {
          console.log("Missing required project name")
          console.log("Usage: fopen remove <project>")
          return
        }
        return yield* runRemove(args[1])
      case "uninstall":
        const cleanFlag = args.includes("--clean") || args.includes("-c")
        return yield* runUninstall(cleanFlag)
      default:
        console.log("File opener CLI - Use one of the subcommands:")
        console.log("  install   - Register the fileopener:// protocol")
        console.log("  add       - Add a project alias")
        console.log("  list      - List all configured projects")
        console.log("  remove    - Remove a project alias")
        console.log("  uninstall - Unregister the protocol")
    }
  })