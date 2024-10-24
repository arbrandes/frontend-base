import { transform } from '@formatjs/ts-transformer';
import { ModuleFederationPlugin } from '@module-federation/enhanced';
import ReactRefreshWebpackPlugin from '@pmmmwh/react-refresh-webpack-plugin';
import ForkTsCheckerWebpackPlugin from 'fork-ts-checker-webpack-plugin';
import MiniCssExtractPlugin from 'mini-css-extract-plugin';
import path from 'path';
import ReactRefreshTypeScript from 'react-refresh-typescript';
import { Configuration } from 'webpack';
import RemoveEmptyScriptsPlugin from 'webpack-remove-empty-scripts';

import {
  getDevServer,
  getFileLoaderRules,
  getIgnoreWarnings,
  getImageMinimizer,
  getStylesheetRule
} from './common-config';

import ParagonWebpackPlugin from './plugins/paragon-webpack-plugin/ParagonWebpackPlugin';

import HtmlWebpackPlugin from 'html-webpack-plugin';
import getLocalAliases from './utils/getLocalAliases';
import getPublicPath from './utils/getPublicPath';
import getResolvedSiteConfigPath from './utils/getResolvedSiteConfigPath';
import getSharedDependencies from './utils/getSharedDependencies';
import {
  getParagonCacheGroups,
  getParagonEntryPoints,
  getParagonThemeCss,
} from './utils/paragonUtils';

const paragonThemeCss = getParagonThemeCss(process.cwd());
const brandThemeCss = getParagonThemeCss(process.cwd(), { isBrandOverride: true });
const aliases = getLocalAliases();
const resolvedSiteConfigPath = getResolvedSiteConfigPath('shell/site.config.dev.shell.tsx');

const config: Configuration = {
  entry: {
    app: path.resolve(process.cwd(), 'shell/index'),
    ...getParagonEntryPoints(paragonThemeCss),
    ...getParagonEntryPoints(brandThemeCss),
  },
  output: {
    path: path.resolve(process.cwd(), './dist'),
    publicPath: getPublicPath('auto'),
    uniqueName: 'mf-shell', // Needed for module federation.
  },
  resolve: {
    alias: {
      ...aliases,
      'site.config': resolvedSiteConfigPath,
    },
    extensions: ['.js', '.jsx', '.ts', '.tsx'],
  },
  ignoreWarnings: getIgnoreWarnings(),
  mode: 'development',
  devtool: 'eval-source-map',
  module: {
    rules: [
      {
        test: /\.(js|jsx|ts|tsx)$/,
        include: [
          /shell/,
          /runtime/,
          path.resolve(process.cwd(), 'types'),
          resolvedSiteConfigPath,
        ],
        use: {
          loader: require.resolve('ts-loader'),
          options: {
            transpileOnly: true,
            compilerOptions: {
              noEmit: false,
            },
            getCustomTransformers() {
              return {
                before: [
                  transform({
                    overrideIdFn: '[sha512:contenthash:base64:6]',
                  }),
                  ReactRefreshTypeScript()
                ],
              };
            },
          },
        },
      },
      getStylesheetRule('dev'),
      ...getFileLoaderRules(),
    ],
  },
  optimization: {
    splitChunks: {
      chunks: 'all',
      cacheGroups: {
        ...getParagonCacheGroups(paragonThemeCss),
        ...getParagonCacheGroups(brandThemeCss),
      },
    },
    minimizer: getImageMinimizer(),
  },
  // Specify additional processing or side-effects done on the Webpack output bundles as a whole.
  plugins: [
    // RemoveEmptyScriptsPlugin get rid of empty scripts generated by webpack when using mini-css-extract-plugin
    // This helps to clean up the final bundle application
    // See: https://www.npmjs.com/package/webpack-remove-empty-scripts#usage-with-mini-css-extract-plugin
    new RemoveEmptyScriptsPlugin(),
    new ParagonWebpackPlugin(),
    // Writes the extracted CSS from each entry to a file in the output directory.
    new MiniCssExtractPlugin({
      filename: '[name].css',
    }),
    new HtmlWebpackPlugin({
      inject: true, // Appends script tags linking to the webpack bundles at the end of the body
      template: path.resolve(process.cwd(), 'shell/public/index.html'),
      chunks: ['app'],
      FAVICON_URL: process.env.FAVICON_URL || null,
      OPTIMIZELY_PROJECT_ID: process.env.OPTIMIZELY_PROJECT_ID || null,
      NODE_ENV: process.env.NODE_ENV || null,
      SITE_NAME: process.env.SITE_NAME || '',
    }),
    new ReactRefreshWebpackPlugin(),
    new ForkTsCheckerWebpackPlugin(),
    new ModuleFederationPlugin({
      name: 'shell',
      shared: getSharedDependencies({ isShell: true }),
    })
  ],
  // This configures webpack-dev-server which serves bundles from memory and provides live
  // reloading.

  devServer: getDevServer(),
};

export default config;
