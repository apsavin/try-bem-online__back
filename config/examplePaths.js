module.exports = {
    excluded: [
        '.git',
        '.gitignore',
        '.idea',
        'README.md',
        'favicon.ico'
    ],
    symlinked: [
        '.bem',
        'libs',
        'node_modules'
    ],
    r: /^(\.bem|desktop\.b|package\.json)((?!(\.sock\b|\bcache\b)).)*$/,
    w: /(^desktop\.blocks\/((?!\.bem).)+\/[\w\-_\.]+$)|(^desktop\.bundles\/((?!\.bem).)+\/\w+\.bemjson.js$)/
};
