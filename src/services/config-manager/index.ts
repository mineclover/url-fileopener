import { Effect, Context, Layer, pipe } from "effect"
import { FileSystem } from "@effect/platform"
import { NodeFileSystem } from "@effect/platform-node"
import { join } from "path"
import { homedir } from "os"
import type { ProjectConfig, ProjectEntry } from "../../models/ProjectConfig.js"
import { convertToProjectEntries, convertFromProjectEntries } from "../../models/ProjectConfig.js"

export interface ConfigManager {
  readonly load: Effect.Effect<ProjectConfig, Error>
  readonly save: (config: ProjectConfig) => Effect.Effect<void, Error>
  readonly addProject: (alias: string, path: string, force?: boolean) => Effect.Effect<void, Error>
  readonly removeProject: (alias: string) => Effect.Effect<ProjectEntry | null, Error>
  readonly listProjects: Effect.Effect<Array<ProjectEntry>, Error>
  readonly getConfigPath: Effect.Effect<string, never>
  readonly ensureConfigDir: Effect.Effect<void, Error>
}

export const ConfigManager = Context.GenericTag<ConfigManager>("ConfigManager")

const DEFAULT_CONFIG_DIR = join(homedir(), ".protocol-registry")
const CONFIG_FILE = "projects.json"

export const ConfigManagerLive = Layer.effect(
  ConfigManager,
  Effect.gen(function* () {
    const fs = yield* FileSystem.FileSystem

    const getConfigPath = Effect.succeed(join(DEFAULT_CONFIG_DIR, CONFIG_FILE))

    const ensureConfigDir = Effect.gen(function* () {
      yield* fs.makeDirectory(DEFAULT_CONFIG_DIR, { recursive: true })
    }).pipe(Effect.orDie)

    const load = Effect.gen(function* () {
      const configPath = yield* getConfigPath
      const exists = yield* fs.exists(configPath)

      if (!exists) {
        return {}
      }

      const content = yield* fs.readFileString(configPath)
      try {
        return JSON.parse(content) as ProjectConfig
      } catch {
        return {}
      }
    }).pipe(Effect.orElse(() => Effect.succeed({})))

    const save = (config: ProjectConfig) => Effect.gen(function* () {
      yield* ensureConfigDir
      const configPath = yield* getConfigPath
      const content = JSON.stringify(config, null, 2)
      yield* fs.writeFileString(configPath, content)
    })

    const addProject = (alias: string, path: string, force = false) => Effect.gen(function* () {
      const config = yield* load

      if (!force && config[alias]) {
        yield* Effect.fail(new Error(`Project alias '${alias}' already exists. Use --force to override.`))
      }

      const updatedConfig = { ...config, [alias]: path }
      yield* save(updatedConfig)
    })

    const removeProject = (alias: string) => Effect.gen(function* () {
      const config = yield* load

      if (!config[alias]) {
        return null
      }

      const removedEntry: ProjectEntry = { alias, path: config[alias] }
      const { [alias]: _, ...updatedConfig } = config
      yield* save(updatedConfig)

      return removedEntry
    })

    const listProjects = Effect.gen(function* () {
      const config = yield* load
      return convertToProjectEntries(config)
    })

    return {
      load,
      save,
      addProject,
      removeProject,
      listProjects,
      getConfigPath,
      ensureConfigDir
    }
  })
)

export const ConfigManagerNode = ConfigManagerLive.pipe(
  Layer.provide(NodeFileSystem.layer)
)