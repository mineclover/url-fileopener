import { CliApp, Command } from "@effect/cli"
import { Effect, Layer } from "effect"
import { NodeContext, NodeRuntime } from "@effect/platform-node"
import { InstallCommand } from "./commands/install.js"
import { AddCommand } from "./commands/add.js"
import { ListCommand } from "./commands/list.js"
import { RemoveCommand } from "./commands/remove.js"
import { UninstallCommand } from "./commands/uninstall.js"
import { ProtocolHandlerLive } from "../services/protocol-handler/index.js"
import { ConfigManagerNode } from "../services/config-manager/index.js"
import { FileOpenerNode } from "../services/file-opener/index.js"
import { LoggerNode } from "../services/logging/index.js"

// Combine all commands
const MainCommand = Command.make("fopen").pipe(
  Command.withSubcommands([
    InstallCommand,
    AddCommand,
    ListCommand,
    RemoveCommand,
    UninstallCommand
  ]),
  Command.withDescription("File opener CLI for managing fileopener:// protocol")
)

// Create the CLI app
const CliApplication = CliApp.make({
  name: "File Opener CLI",
  version: "1.0.0",
  command: MainCommand
})

// Main application layer with all dependencies
// Note: FileOpenerNode depends on ConfigManagerNode, so we need proper ordering
const MainLayer = Layer.mergeAll(
  ProtocolHandlerLive,
  LoggerNode
).pipe(
  Layer.merge(ConfigManagerNode),
  Layer.merge(FileOpenerNode)
)

// Run the CLI
const run = CliApp.run(CliApplication, process.argv.slice(2))

Effect.suspend(() => run).pipe(
  Effect.provide(MainLayer),
  Effect.provide(NodeContext.layer),
  NodeRuntime.runMain
)