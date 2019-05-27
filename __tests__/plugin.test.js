const ServerlessElasticmqLocal = require('../index')
const path = require('path')

describe('serverless-elasticmq-local plugin (js)', () => {
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
  const Plugin = new ServerlessElasticmqLocal(mockServerlessInstance)
  it('can install', async () => {
    await Plugin.installHandler()
  })
})
