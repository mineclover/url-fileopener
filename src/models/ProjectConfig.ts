import { Schema } from "effect"

export type ProjectConfig = Record<string, string>

export const ProjectConfigSchema = Schema.Record({
  key: Schema.String,
  value: Schema.String
})

export interface ProjectEntry {
  readonly alias: string
  readonly path: string
}

export const ProjectEntrySchema = Schema.Struct({
  alias: Schema.String,
  path: Schema.String
})

export const convertToProjectEntries = (config: ProjectConfig): Array<ProjectEntry> =>
  Object.entries(config).map(([alias, path]) => ({ alias, path }))

export const convertFromProjectEntries = (entries: Array<ProjectEntry>): ProjectConfig =>
  entries.reduce((acc, { alias, path }) => ({ ...acc, [alias]: path }), {})