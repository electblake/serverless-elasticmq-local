import * as _ from 'lodash'
import * as path from 'path'
const debug = require('debug')('serverless-sqs-local')
import { ServerlessService, SQSPluginConfig } from './types'
import { SQSLocalOptions } from 'sqs-localhost'
import SQSLocal from 'sqs-localhost'

export default class ServerlessElasticmqLocal {
  get port() {
    const config = (this.service.custom && this.service.custom.sqs) || {}
    const port = _.get(config, 'start.port', 8000)
    return port
  }

  get host() {
    const config = (this.service.custom && this.service.custom.sqs) || {}
    const host = _.get(config, 'start.host', 'localhost')
    return host
  }

  /**
   * Get the stage
   *
   * @return {String} the current stage
   */
  get stage() {
    return (this.config && this.config.stage) || (this.service.provider && this.service.provider.stage)
  }

  /**
   * Gets the table definitions
   */
  get tables() {
    let stacks = []

    const defaultStack = this.getDefaultStack()
    if (defaultStack) {
      stacks.push(defaultStack)
    }

    if (this.hasAdditionalStacksPlugin()) {
      stacks = stacks.concat(this.getAdditionalStacks())
    }

    return stacks
      .map((stack) => this.getTableDefinitionsFromStack(stack))
      .reduce((tables, tablesInStack) => tables.concat(tablesInStack), [])
  }
  // @ts-ignore
  private serverless: ServerlessInstance
  private service: ServerlessService
  private serverlessLog: any
  private config: SQSLocalOptions & SQSPluginConfig
  private options: SQSLocalOptions
  private sqsLocal: SQSLocal

  // @ts-ignore
  private provider: string
  // @ts-ignore
  private commands: object
  // @ts-ignore
  private hooks: object

  constructor(serverless, options) {
    this.serverless = serverless
    this.service = serverless.service
    this.serverlessLog = serverless.cli.log.bind(serverless.cli)
    this.config = (this.service.custom && this.service.custom.sqs) || {}
    this.sqsLocal = new SQSLocal()
    this.options = _.merge(
      {
        installPath: serverless.config && path.join(serverless.config.servicePath, '.sqs'),
      },
      options,
    )
    this.provider = 'aws'
    this.commands = {
      sqs: {
        commands: {
          start: {
            lifecycleEvents: ['startHandler'],
            usage: 'Starts local SQS',
            options: {
              //   port: {
              //     shortcut: 'p',
              //     usage:
              //       'The port number that SQS will use to communicate with your application.
              // If you do not specify this option, the default port is 8000',
              //   },
              migrate: {
                shortcut: 'm',
                usage: 'After starting SQS local, create SQS tables from the current serverless configuration.',
              },
              migration: {
                shortcut: 'm',
                usage: 'After starting SQS local, run SQS migrations',
              },
            },
          },
          // noStart: {
          //   shortcut: 'n',
          //   default: false,
          //   usage: 'Do not start SQS local (in case it is already running)',
          // },
          remove: {
            lifecycleEvents: ['removeHandler'],
            usage: 'Removes local SQS',
          },
          install: {
            usage: 'Installs local SQS',
            lifecycleEvents: ['installHandler'],
            options: {
              installPath: {
                shortcut: 'x',
                usage: 'Local SQS install path',
              },
            },
          },
        },
      },
    }

    this.hooks = {
      'sqs:remove:removeHandler': this.removeHandler.bind(this),
      'sqs:install:installHandler': this.installHandler.bind(this),
      'sqs:start:startHandler': this.startHandler.bind(this),
      'before:offline:start:init': this.startHandler.bind(this),
      'before:offline:start:end': this.endHandler.bind(this),
    }
  }

  public removeHandler() {
    return this.sqsLocal.remove()
  }

  public async installHandler() {
    if (this.config.verbose) {
      debug('installHandler', this.options)
    }
    return this.sqsLocal.install(this.options)
  }

  public startHandler() {
    if (this.shouldExecute()) {
      const config = (this.service.custom && this.service.custom.sqs) || {}
      const options = _.merge(
        {
          // sharedDb: this.options.sharedDb || true,
          installPath: this.options.installPath,
        },
        config && config.start,
        this.options,
      )

      // otherwise endHandler will be mis-informed
      this.options = options

      // let dbPath = options.dbPath
      // if (dbPath) {
      //   options.dbPath = path.isAbsolute(dbPath) ? dbPath : path.join(this.serverless.config.servicePath, dbPath)
      // }

      // if (!options.noStart) {
      this.sqsLocal.start()
      // }
      return Promise.resolve()
      // .then(() => options.migrate && this.migrateHandler())
      // .then(() => options.seed && this.seedHandler())
    } else {
      this.serverlessLog('Skipping start: SQS Local is not available for stage: ' + this.stage)
    }
  }

  public endHandler() {
    // if (this.shouldExecute() && !this.options.noStart) {
    if (this.shouldExecute()) {
      this.serverlessLog('SQS - stopping local elasticmq')
      this.sqsLocal.stop()
    } else {
      this.serverlessLog('Skipping end: SQS Local is not available for stage: ' + this.stage)
    }
  }

  /**
   * To check if the handler needs to be executed based on stage
   *
   * @return {Boolean} if the handler can run for the provided stage
   */
  private shouldExecute() {
    if (this.config.stages && this.config.stages.includes(this.stage)) {
      return true
    }
    return false
  }

  private getDefaultStack() {
    return _.get(this.service, 'resources')
  }

  private getAdditionalStacks() {
    return _.values(_.get(this.service, 'custom.additionalStacks', {}))
  }

  private hasAdditionalStacksPlugin() {
    return _.get(this.service, 'plugins', []).includes('serverless-plugin-additional-stacks')
  }

  private getTableDefinitionsFromStack(stack) {
    const resources = _.get(stack, 'Resources', [])
    return Object.keys(resources)
      .map((key) => {
        if (resources[key].Type === 'AWS::sqs::Table') {
          return resources[key].Properties
        }
      })
      .filter((n) => n)
  }

  // private createTable(dynamodb, migration) {
  //   return new Promise((resolve, reject) => {
  //     if (migration.StreamSpecification && migration.StreamSpecification.StreamViewType) {
  //       migration.StreamSpecification.StreamEnabled = true
  //     }
  //     if (migration.TimeToLiveSpecification) {
  //       delete migration.TimeToLiveSpecification
  //     }
  //     if (migration.SSESpecification) {
  //       migration.SSESpecification.Enabled = migration.SSESpecification.SSEEnabled
  //       delete migration.SSESpecification.SSEEnabled
  //     }
  //     if (migration.PointInTimeRecoverySpecification) {
  //       delete migration.PointInTimeRecoverySpecification
  //     }
  //     if (migration.Tags) {
  //       delete migration.Tags
  //     }
  //     if (migration.BillingMode === 'PAY_PER_REQUEST') {
  //       delete migration.BillingMode

  //       const defaultProvisioning = {
  //         ReadCapacityUnits: 5,
  //         WriteCapacityUnits: 5,
  //       }
  //       migration.ProvisionedThroughput = defaultProvisioning
  //       if (migration.GlobalSecondaryIndexes) {
  //         migration.GlobalSecondaryIndexes.forEach((gsi) => {
  //           gsi.ProvisionedThroughput = defaultProvisioning
  //         })
  //       }
  //     }
  //     dynamodb.raw.createTable(migration, (err) => {
  //       if (err) {
  //         if (err.name === 'ResourceInUseException') {
  //           this.serverlessLog(`DynamoDB - Warn - table ${migration.TableName} already exists`)
  //           resolve()
  //         } else {
  //           this.serverlessLog('DynamoDB - Error - ', err)
  //           reject(err)
  //         }
  //       } else {
  //         this.serverlessLog('DynamoDB - created table ' + migration.TableName)
  //         resolve(migration)
  //       }
  //     })
  //   })
  // }
}
