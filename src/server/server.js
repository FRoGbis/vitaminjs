/* eslint-disable no-console, global-require  */
import koa from 'koa';
import express from 'express';
import config from '../../config';
import app from './app';


function hotReloadServer() {
    const server = express();
    const webpack = require('webpack');
    let clientBuildConfig = require('../../config/build/webpack.config.client')({
        hot: true,
        dev: true,
    });
    const hmrPath = `${config.server.basePath + config.build.client.publicPath}/__webpack_hmr`;
    clientBuildConfig = clientBuildConfig
        .map(webpackConfig => ({
            ...webpackConfig,
            entry: [
                webpackConfig.entry,
                `webpack-hot-middleware/client?path=${config.server.externalUrl + hmrPath}`,
            ],
        }))
        .map(webpackConfig => ({
            ...webpackConfig,
            output: {
                ...webpackConfig.output,
                filename: webpackConfig.output.filename.replace(/\[hash\]/, 'hot'),
            },
        }));
    const compiler = webpack(clientBuildConfig);
    server.use(require('webpack-dev-middleware')(compiler, {
        noInfo: true,
        publicPath: clientBuildConfig[0].output.publicPath,
    }));
    server.use(require('webpack-hot-middleware')(compiler, {
        path: hmrPath,
        quiet: true,
        noInfo: true,
        reload: true,
    }));
    return server;
}

let currentApp = app;
function appServer() {
    const server = koa();
    const appWrapper = function* appWrapper(next) {
        yield currentApp.call(this, next);
    };
    server.use(appWrapper);
    return server.callback();
}

const mountedServer = express();
if (module.hot) {
    mountedServer.use(hotReloadServer());
    module.hot.accept('./app', () => {
        try {
            currentApp = require('./app').default;
        } catch (e) {
            console.error(e);
        }
    });
}

const { basePath, port, host } = config.server;
mountedServer.use(basePath, appServer());
mountedServer.listen(port, host, () => {
    console.log(`Server listening on http://${host}:${port}`);
});
