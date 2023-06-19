'use strict';

const { execSync } = require('child_process');
const webpack = require('webpack');

execSync('./node_modules/.bin/tailwindcss -o ./public/style.css');
console.log('Compiled css');

const config = {
  mode: 'development',
  // You need to list out every file you want to bundle in `entry`
  entry: {
    main: `${__dirname}/main.js`
  },
  output: {
    path: `${__dirname}/public`,
    filename: '[name].js'
  },
  optimization: {
    minimize: false
  },
  target: 'web',
  resolve: {
    fallback: {
      assert: require.resolve('assert-browserify'),
      buffer: require.resolve('buffer'),
      crypto: require.resolve('crypto-browserify'),
      stream: require.resolve('stream-browserify'),
      path: require.resolve('path-browserify')
    }
  }
};

const compiler = webpack(config);

compiler.run((err, res) => {
  if (err) {
    process.nextTick(() => { throw new Error('Error compiling bundle: ' + err.stack); });
  }
  console.log(res);
  console.log('Webpack compiled successfully');
  process.exit(0);
});