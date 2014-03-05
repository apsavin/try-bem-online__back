/**
 * @param {Array} array
 * @param {Function} fn
 * @param {Function} callback
 */
module.exports = function (array, fn, callback) {
    var count = array.length,
        wasCalled = false,
        itemCallback = function (err) {
            if (wasCalled) {
                return;
            }
            if (err) {
                callback(err);
                wasCalled = true;
                return;
            }
            if (!--count) {
                callback(null);
            }
        };
    array.forEach(function (item) {
        fn(item, itemCallback);
    });
};