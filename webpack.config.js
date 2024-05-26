const WebpackManager = require('./webpack/webpack-manager');
const webpackManager = new WebpackManager();
module.exports       = webpackManager.getConfig();