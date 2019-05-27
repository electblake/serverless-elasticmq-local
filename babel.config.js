module.exports = {
  presets: [
    '@babel/env',
    {
      targets: {
        node: 'current',
      },
    },
    '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/proposal-class-properties',
    [
      '@babel/plugin-proposal-decorators',
      {
        legacy: true,
      },
    ],
    [
      '@babel/plugin-transform-runtime',
      {
        helpers: true,
        regenerator: true,
        useESModules: false,
      },
    ],
  ],
}
