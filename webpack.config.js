/* eslint-env node */

const webpack = require('webpack');

module.exports = {
  // ...existing configuration...
  plugins: [
    // ...existing plugins...
    new webpack.DefinePlugin({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV || 'development'),
      'process.env.PUBLIC_URL': JSON.stringify(process.env.PUBLIC_URL || ''),
    }),
  ],
};
