const uri      = require('./uri');
const PathInfo = require('./path-info');

function readDirectory(path) {
    let result = {};
    path.files.forEach((file)   => result[file.name]   = require(file.fullPath));
    path.folders.forEach((folder) => result[folder.name] = readDirectory(folder));
    return result;
}

function requireTree(...parts) {
    try {
        return readDirectory(new PathInfo(...parts));
    } catch (error) {
        if (error.code !== 'ENOENT') {
            console.log(`requireTree: ${error}`);
        }
        return {};
    }
}

requireTree.cwd = (...parts) => {
    return requireTree(uri.joinPathCwd(...parts));
}

requireTree.module = (module, ...parts) => {
    let modulePath = uri.pathDirectory(module.filename);
    return requireTree(modulePath, ...parts);
}

module.exports = requireTree;