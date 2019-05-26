import { SQSLocalOptions } from 'sqs-localhost'

export interface ServerlessService {
  provider: {
    name: string
    stage: string
  }
  functions: { [key: string]: ServerlessFunction }
  package: ServerlessPackage
  getAllFunctions: () => string[]
  custom: {
    sqs?: SQSLocalOptions
  }
}

export interface SQSPluginConfig {
  stage?: string
  stages?: string
  verbose?: boolean
  installpath?: string
}

export interface ServerlessInstance {
  cli: {
    log(str: string)
  }
  config: {
    servicePath: string
  }
  service: ServerlessService
  pluginManager: PluginManager
}

export interface ServerlessOptions {
  function?: string
  watch?: boolean
  extraServicePath?: string
}

export interface ServerlessFunction {
  handler: string
  package: ServerlessPackage
}

export interface ServerlessPackage {
  include: string[]
  exclude: string[]
  artifact?: string
  individually?: boolean
}

export interface PluginManager {
  spawn(command: string): Promise<void>
}
