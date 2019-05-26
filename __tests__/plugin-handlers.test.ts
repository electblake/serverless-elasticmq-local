import ServerlessSQSLocal from '../src/index'
import * as path from 'path'
// import fs from 'fs'

describe('serverless-sqs-local plugin', () => {
  const mockServerlessInstance = {
    config: {
      servicePath: path.resolve(__dirname, '../'),
    },
    service: {},
    cli: {
      log: () => {},
    },
    custom: {},
  }
  const Plugin = new ServerlessSQSLocal(mockServerlessInstance, {})
  it('can install', async () => {
    await Plugin.installHandler()
    return true
  }, 10000)

  // it('can start', async () => {
  //   await Plugin.installHandler()
  //   await Plugin.startHandler()
  // })
  // it('can remove', async () => {
  //   await Plugin.installHandler()
  //   await Plugin.removeHandler()
  // })
})
