const express     = require('express');
const http        = require('http');
const winston     = require('winston');
const middlewares = require('../core/middlewares');
const config      = require('../../config');
const RouterTree  = require('./RouterTree');
const uri         = require('../core/utils/uri');

class App {
    constructor() {
        this.express = express();
        this.root    = this.express;
        this.server  = http.createServer(this.express);
        this.logger  = this.createLogger();

        middlewares.express(this.root);

        this.addStatic(config.app.static);
        this.addRoutes(config.app.routes);
    }

    addRoutes(items) {
        if (items) {
            items.forEach((item) => new RouterTree(item.prefix, uri.joinPathCwd(item.path)).use(this.root));
        }
    }

    addStatic(items) {
        if (items) {
            items.forEach((item) => this.express.use(express.static(uri.joinPathCwd(item.path))));
        }
    }

    createLogger() {
        return winston.createLogger({
            level       : 'info',
            format      : winston.format.json(),
            defaultMeta : { service: 'user-service' },
            transports  : [
                new winston.transports.File({
                    filename : 'logs/error.log',
                    level: 'error'
                }),
                new winston.transports.File({
                    filename : 'logs/logs.log'
                }),
                new winston.transports.Console({
                    format : winston.format.simple()
                })
            ]
        });
    }

    start() {
        this.server.listen(config.app.port, () => this.logger.info(`Server started at ${this.getUrl()}`));
    }

    startDevelopment() {

        const webpack       = require('webpack');
        const devMiddleware = require('webpack-dev-middleware');
        const hotMiddleware = require('webpack-hot-middleware');
        const webpackConfig = require('../../../webpack.config');

        const compiler = webpack(webpackConfig);

        const devMiddlewareInstance = devMiddleware(compiler, {
            publicPath  : webpackConfig.output.publicPath,
            writeToDisk : (filePath) => /\.html$/.test(filePath),
            stats       : {
                children : false,
                colors   : true
            },
        });
        devMiddlewareInstance.waitUntilValid(() => this.logger.info(`Server started at ${this.getUrl()}`));

        this.express.use(devMiddlewareInstance);
        this.express.use(hotMiddleware(compiler));

        this.server.listen(config.app.port);
    }

    getUrl() {
        return `${config.app.protocol}://${config.app.host}:${config.app.port}/`;
    }
}

module.exports = App;