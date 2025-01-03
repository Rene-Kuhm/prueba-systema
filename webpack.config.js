/* eslint-env node */

import { DefinePlugin } from 'webpack';

export default {
  // ...existing configuration...
  plugins: [
    // ...existing plugins...
    new DefinePlugin({
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
