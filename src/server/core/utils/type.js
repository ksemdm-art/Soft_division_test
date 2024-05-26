const toString = Object.prototype.toString;

function type(val){
    switch (toString.call(val)) {
        case '[object Date]':      return 'date';
        case '[object RegExp]':    return 'regexp';
        case '[object Arguments]': return 'arguments';
        case '[object Array]':     return 'array';
        case '[object Error]':     return 'error';
    }

    if (val === null)              return 'null';
    if (val === undefined)         return 'undefined';
    if (val !== val)               return 'nan';
    if (val && val.nodeType === 1) return 'element';

    if (isBuffer(val)) return 'buffer';

    val = val.valueOf ? val.valueOf() : Object.prototype.valueOf.apply(val);

    return typeof val;
};

function isBuffer (obj) {
    return !!obj.constructor && typeof obj.constructor.isBuffer === 'function' && obj.constructor.isBuffer(obj)
}

module.exports = type;