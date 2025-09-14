import { Layer } from "effect"
import { NodeContext } from "@effect/platform-node"
import { ProtocolHandlerLive } from "../../src/services/protocol-handler/index.js"
import { ConfigManagerNode } from "../../src/services/config-manager/index.js"
import { FileOpenerNode } from "../../src/services/file-opener/index.js"
import { LoggerNode } from "../../src/services/logging/index.js"

// Minimal layer for install/uninstall commands (only protocol handler and logger)
export const TestInstallLayer = Layer.mergeAll(
  ProtocolHandlerLive,
  LoggerNode,
  NodeContext.layer
)

// Layer for config-related commands (add, remove, list)
export const TestConfigLayer = Layer.mergeAll(
  ConfigManagerNode,
  LoggerNode,
  NodeContext.layer
)

// Test layer that provides all dependencies needed for command testing
export const TestMainLayer = Layer.mergeAll(
  ProtocolHandlerLive,
  ConfigManagerNode,
  FileOpenerNode,
  LoggerNode
)

// Full test layer including Node context
export const TestFullLayer = Layer.mergeAll(
  TestMainLayer,
  NodeContext.layer
)