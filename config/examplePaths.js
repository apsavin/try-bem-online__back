module.exports = {
    copied: [
        '.bem/configs',
        '.bem/levels',
        '.bem/techs',
        '.bem/level.js',
        '.bem/make.js',
        '.bem/repo.db.js',
        'desktop.blocks',
        'desktop.bundles',
        'package.json'
    ],
    symlinked: [
        'libs',
        'node_modules'
    ],
    r: /^(\.bem|desktop\.b|package\.json)((?!(\.sock\b|\bcache\b)).)*$/,
    w: /(^desktop\.blocks\/((?!\.bem).)+\/[\w\-_\.]+$)|(^desktop\.bundles\/((?!\.bem).)+\/\w+\.bemjson.js$)/
};
