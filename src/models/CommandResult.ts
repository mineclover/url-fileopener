import { Schema } from "effect"

export interface CommandResult<T = any> {
  readonly success: boolean
  readonly message: string
  readonly data?: T
  readonly error?: string
}

export const CommandResultSchema = <T>(dataSchema?: Schema.Schema<T>) =>
  Schema.Struct({
    success: Schema.Boolean,
    message: Schema.String,
    data: dataSchema ? Schema.optional(dataSchema) : Schema.optional(Schema.Unknown),
    error: Schema.optional(Schema.String)
  })

export const createSuccessResult = <T>(message: string, data?: T): CommandResult<T> => ({
  success: true,
  message,
  data
})

export const createErrorResult = (error: string, data?: any): CommandResult => ({
  success: false,
  message: "",
  error,
  data
})