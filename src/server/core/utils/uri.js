const path = require('path');

function join(sep, ...parts) {
    let result = path.normalize(path.join(...parts));
    if (sep && sep !== path.sep) {
        result = result.replace(/(\\|\/)/g, sep);
    }
    return result;
}

class Uri {
    joinPath(...parts) {
        return join(null, ...parts);
    }

    joinPathCwd (...parts) {
        return join(null, process.cwd(), ...parts);
    }

    joinWeb(...parts) {
        return join('/', ...parts);
    }

    pathDirectory(...parts) {
        return path.dirname(this.joinPath(...parts));
    }

    pathCwdDirectory(...parts) {
        return path.dirname(this.joinPathCwd(...parts));
    }
}

const uri = new Uri();

module.exports = uri;