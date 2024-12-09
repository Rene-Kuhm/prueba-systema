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
  devServer: {
    contentBase: './public',
    historyApiFallback: true, // Asegúrate de que las rutas se manejen correctamente
    headers: {
      'Content-Type': 'application/javascript', // Asegúrate de que el MIME type sea correcto
    },
  },
};
