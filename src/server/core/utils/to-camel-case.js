function toCamelCase(str) {
    return str.substring(0, 1).toLowerCase() + str.substring(1);
}

module.exports = toCamelCase;
