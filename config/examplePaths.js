module.exports = {
    copied: [
        '.bem/levels',
        '.bem/techs',
        '.bem/level.js',
        '.bem/make.js',
        'desktop.blocks',
        'desktop.bundles',
        'package.json'
    ],
    symlinked: [
        'libs',
        'node_modules'
    ],
    r: /^(\.bem|desktop\.b|package\.json|libs)((?!(\.sock\b|\bcache\b)).)*$/,
    w: /(^desktop\.blocks\/((?!\.bem).)+\/[\w\-_\.]+$)|(^desktop\.bundles\/((?!\.bem).)+\/\w+\.bemjson.js$)/,
    bundles: 'desktop.bundles'
};
