const express     = require('express');
const type        = require('../core/utils/type');
const requireTree = require('../core/utils/require-tree');

const MIDDLEWARES = '.middlewares';
const SECURITY    = '.security';

class RouterTree {

    constructor(name, path) {
        this._name = name;
        this._path = path;
    }

    use(app) {
        let router = express.Router({
            mergeParams: true
        });
        this._execute((method, parts, middlewares, func) => {
            parts = parts.filter((part) => !!part);
            let path = `/${parts.join('/')}`;
            router[method](path, ...middlewares, (req, res, next) => {
                let result = func(req, res, next);
                if (result instanceof Promise) {
                    result
                        .then((result) => result != null && res.json(result))
                        .catch(next);
                }
            });
        });
        app.use('/', router)
    }

    _execute(handler, obj, middlewares, name, ...parts) {
        if (obj == null) {
            obj = requireTree(this._path);
            middlewares = [];
            name = this._name;
            parts = [];
        }
        switch (type(obj)) {
            case 'function':
                if (obj[SECURITY]) {
                    middlewares.push(...this._getMiddlewares(obj[SECURITY]));
                    delete obj[SECURITY];
                }
                if (obj[MIDDLEWARES]) {
                    middlewares.push(...this._getMiddlewares(obj[MIDDLEWARES]));
                    delete obj[MIDDLEWARES];
                }
                name = this._splitName(name);
                let method = name.shift();
                parts.push(...name);
                handler(method, parts, middlewares, obj);
                break;
            case 'array':
                let functions = obj.filter((o) => type(o) === 'function');
                if (functions.length) {
                    name = this._splitName(name);
                    let method = name.shift();
                    parts.push(...name);
                    handler(method, parts, middlewares, functions);
                }
                break;
            case 'object':
                if (obj[SECURITY]) {
                    middlewares.push(...this._getMiddlewares(obj[SECURITY]));
                    delete obj[SECURITY];
                }
                if (obj[MIDDLEWARES]) {
                    middlewares.push(...this._getMiddlewares(obj[MIDDLEWARES]));
                    delete obj[MIDDLEWARES];
                }
                name = this._splitName(name);
                Object.keys(obj).forEach((key) => {
                    this._execute(handler, obj[key], middlewares.slice(), key, ...parts, ...name);
                });
                break;
        }
    }

    _splitName(name) {
        return name.split('-').map((item) => {
            if (item.startsWith('(')) {
                return `:${item.slice(1,-1)}`;
            }
            return item;
        });
    }

    _getMiddlewares(obj, result) {
        result = result || [];
        switch (type(obj)) {
            case 'function':
                result.push(obj);
                break;
            case 'array':
                obj.forEach((o) => this._getMiddlewares(o, result));
                break;
            case 'object':
                Object.keys(obj).forEach((key) => this._getMiddlewares(obj[key], result));
                break;
        }
        return result;
    }
}

module.exports = RouterTree;