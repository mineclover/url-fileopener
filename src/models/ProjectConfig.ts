import * as Schema from "effect/Schema"

export const ProjectConfig = Schema.Struct({
  projects: Schema.Record({
    key: Schema.String,
    value: Schema.String
  }),
  version: Schema.String,
  lastUpdated: Schema.String
})

export type ProjectConfig = Schema.Schema.Type<typeof ProjectConfig>

export const defaultProjectConfig = (): ProjectConfig => ({
  projects: {},
  version: "1.0.0",
  lastUpdated: new Date().toISOString()
})