const path = require('path');
const fs   = require('fs');
const uri  = require('./uri');

class PathInfo {
    constructor(...parts) {
        this.fullPath    = uri.joinPath(...parts);
        this.path        = path.basename(this.fullPath);
        this.ext         = path.extname(this.path);
        this.name        = path.basename(this.path, this.ext);
        this.isDirectory = fs.lstatSync(this.fullPath).isDirectory();

        if (this.isDirectory) {
            this._folders = null;
            this._files = null;
        } else {
            this._folders = [];
            this._files = [];
        }
    }

    forward(handler) {
        handler(this);
        this.files.forEach((file) => file.forward(handler));
        this.folders.forEach((folder) => folder.forward(handler));
    }

    backward(handler) {
        this.folders.forEach((folder) => folder.backward(handler));
        this.files.forEach((file) => file.backward(handler));
        handler(this);
    }

    remove(filter = null) {
        this.backward((item) => {
            if (filter && !filter(item)) {
                return;
            }
            if (item.isDirectory) {
                fs.rmdirSync(item.fullPath);
            } else {
                fs.unlinkSync(item.fullPath);
            }
        });
        this._folders = null;
        this._files = null;
    }

    clear() {
        this.remove((item) => item != this);
    }

    addFolder(...parts) {
        let path = uri.joinPath(this.fullPath, ...parts);
        fs.mkdirSync(path);
        return new PathInfo(path);
    }

    addTextFile(data, ...parts) {
        let path = uri.joinPath(this.fullPath, ...parts);
        fs.writeFileSync(path, data, 'utf8');
        return new PathInfo(path);
    }

    get folders() {
        if (!this._folders) {
            this._readDir();
        }
        return this._folders;
    }

    get files() {
        if (!this._files) {
            this._readDir();
        }
        return this._files;
    }

    _readDir() {
        this._folders = [];
        this._files = [];
        let names = fs.readdirSync(this.fullPath);
        names.forEach((name) => {
            let pathInfo = new PathInfo(this.fullPath, name);
            if (pathInfo.isDirectory) {
                this._folders.push(pathInfo);
            } else {
                this._files.push(pathInfo);
            }
        });
    }
}

PathInfo.cwd = (...parts) => {
    return new PathInfo(uri.joinPathCwd(...parts));
};

PathInfo.module = (module, ...parts) => {
    let modulePath = uri.pathDirectory(module.filename);
    return PathInfo(modulePath, ...parts);
};

module.exports = PathInfo;