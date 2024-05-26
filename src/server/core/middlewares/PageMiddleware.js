const fs     = require('fs');
const config = require('../../../config');

const pages = {};

function getPage(name) {
    if (config.isDev) {
        return fs.readFileSync(`./dist/client/${config.nodeEnv}/${name}.html`, 'utf-8');
    }
    if (!pages[name]) {
        pages[name] = fs.readFileSync(`./dist/client/${config.nodeEnv}/${name}.html`, 'utf-8');
    }
    return pages[name];
}

function PagesMiddleware(req, res, next) {
    res.page = (settings) => {
        let template = getPage(settings.name);
        res.send(template);
    };
    next();
}

module.exports = PagesMiddleware;