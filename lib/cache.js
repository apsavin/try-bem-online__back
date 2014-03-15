/**
 * @class Cache
 * @constructor
 */
function Cache () {
    /**
     * @type {Object.<String>}
     * @private
     */
    this._cache = {};
}

/**
 * @param {String} key
 * @param {*} value
 */
Cache.prototype.set = function (key, value) {
    this._cache[key] = JSON.stringify(value);
};

/**
 * @param {String} key
 */
Cache.prototype.get = function (key) {
    var value = this._cache[key];
    return value ? JSON.parse(value) : value;
};

/**
 * @param {String} key
 */
Cache.prototype.remove = function (key) {
    delete this._cache[key];
};

module.exports = new Cache();
