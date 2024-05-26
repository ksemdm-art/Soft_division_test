const requireTree = require('../server/core/utils/require-tree');

const DEVELOPMENT = 'development';
const PRODUCTION  = 'production';

const { NODE_ENV = DEVELOPMENT } = process.env;

const env    = requireTree.module(module, `./${NODE_ENV}`);
const local  = requireTree.module(module, `./${NODE_ENV}_local`);

const config = {
    ... env,
    ... local,

    nodeEnv : NODE_ENV,
    isDev   : NODE_ENV === DEVELOPMENT,
    isProd  : NODE_ENV === PRODUCTION
};

if (!config.isDev && !config.isProd) {
    throw new Error(`Wrong environment in config: ${NODE_ENV}`);
}

module.exports = config;