import * as Effect from "effect/Effect"
import * as Context from "effect/Context"
import * as FileSystem from "@effect/platform/FileSystem"
import * as Path from "@effect/platform/Path"
import * as Schema from "effect/Schema"
import { homedir } from "os"
import { join } from "path"
import type { ProjectConfig } from "../../models/ProjectConfig.js"
import { ProjectConfig as ProjectConfigSchema, defaultProjectConfig } from "../../models/ProjectConfig.js"

export interface ConfigManager {
  readonly getConfig: () => Effect.Effect<ProjectConfig, Error>
  readonly saveConfig: (config: ProjectConfig) => Effect.Effect<void, Error>
  readonly addProject: (name: string, path: string) => Effect.Effect<void, Error>
  readonly removeProject: (name: string) => Effect.Effect<boolean, Error>
  readonly getProjectPath: (name: string) => Effect.Effect<string | undefined, Error>
  readonly listProjects: () => Effect.Effect<Record<string, string>, Error>
}

export const ConfigManager = Context.GenericTag<ConfigManager>("ConfigManager")

const CONFIG_DIR = join(homedir(), ".protocol-registry")
const CONFIG_FILE = join(CONFIG_DIR, "config.json")

export const ConfigManagerLive = ConfigManager.of({
  getConfig: () =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem
      const path = yield* Path.Path

      const configDirExists = yield* fs.exists(CONFIG_DIR)
      if (!configDirExists) {
        yield* fs.makeDirectory(CONFIG_DIR, { recursive: true })
      }

      const configExists = yield* fs.exists(CONFIG_FILE)
      if (!configExists) {
        const defaultConfig = defaultProjectConfig()
        yield* fs.writeFileString(CONFIG_FILE, JSON.stringify(defaultConfig, null, 2))
        return defaultConfig
      }

      const configContent = yield* fs.readFileString(CONFIG_FILE)
      const parsedConfig = JSON.parse(configContent)

      return yield* Schema.decodeUnknown(ProjectConfigSchema)(parsedConfig)
    }).pipe(
      Effect.catchAll((error) =>
        Effect.fail(new Error(`Failed to get config: ${error instanceof Error ? error.message : String(error)}`))
      )
    ),

  saveConfig: (config: ProjectConfig) =>
    Effect.gen(function* () {
      const fs = yield* FileSystem.FileSystem

      const configDirExists = yield* fs.exists(CONFIG_DIR)
      if (!configDirExists) {
        yield* fs.makeDirectory(CONFIG_DIR, { recursive: true })
      }

      const updatedConfig = {
        ...config,
        lastUpdated: new Date().toISOString()
      }

      yield* fs.writeFileString(CONFIG_FILE, JSON.stringify(updatedConfig, null, 2))
    }).pipe(
      Effect.catchAll((error) =>
        Effect.fail(new Error(`Failed to save config: ${error instanceof Error ? error.message : String(error)}`))
      )
    ),

  addProject: (name: string, path: string) =>
    Effect.gen(function* () {
      const config = yield* ConfigManager.getConfig()
      const fs = yield* FileSystem.FileSystem

      // Validate that the path exists
      const pathExists = yield* fs.exists(path)
      if (!pathExists) {
        yield* Effect.fail(new Error(`Path does not exist: ${path}`))
      }

      const updatedConfig: ProjectConfig = {
        ...config,
        projects: {
          ...config.projects,
          [name]: path
        }
      }

      yield* ConfigManager.saveConfig(updatedConfig)
    }),

  removeProject: (name: string) =>
    Effect.gen(function* () {
      const config = yield* ConfigManager.getConfig()

      if (!(name in config.projects)) {
        return false
      }

      const { [name]: removed, ...remainingProjects } = config.projects
      const updatedConfig: ProjectConfig = {
        ...config,
        projects: remainingProjects
      }

      yield* ConfigManager.saveConfig(updatedConfig)
      return true
    }),

  getProjectPath: (name: string) =>
    Effect.gen(function* () {
      const config = yield* ConfigManager.getConfig()
      return config.projects[name]
    }),

  listProjects: () =>
    Effect.gen(function* () {
      const config = yield* ConfigManager.getConfig()
      return config.projects
    })
})