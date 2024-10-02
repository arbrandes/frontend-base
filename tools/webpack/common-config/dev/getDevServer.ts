import path from 'path';
import { Configuration } from 'webpack-dev-server';

import getPublicPath from "../../utils/getPublicPath";

export default function getDevServer(): Configuration {
  return {
    // Setting the Access-Control-Allow-Origin header is required to get module federation to work
    // locally.
    devMiddleware: {
      publicPath: getPublicPath(),
    },
    headers: {
      'Access-Control-Allow-Origin': '*',
    },
    historyApiFallback: {
      index: path.join(getPublicPath(), 'index.html'),
      disableDotRule: true,
    },
    host: '0.0.0.0',
    hot: true,
    port: process.env.PORT || 8080,
    // Enable hot reloading server. It will provide WDS_SOCKET_PATH endpoint
    // for the WebpackDevServer client so it can learn when the files were
    // updated. The WebpackDevServer client is included as an entry point
    // in the webpack development configuration. Note that only changes
    // to CSS are currently hot reloaded. JS changes will refresh the browser.
    webSocketServer: 'ws',
  }
}
