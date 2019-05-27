import ServerlessElasticmqLocal from '../src/plugin'
import * as path from 'path'
// import fs from 'fs'
// console.log('imported', ServerlessElasticmqLocal)
describe('serverless-elasticmq-local plugin (ts)', () => {
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
  const Plugin = new ServerlessElasticmqLocal(mockServerlessInstance, {})
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
