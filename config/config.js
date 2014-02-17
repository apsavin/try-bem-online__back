module.exports = {
    exampleDir: 'try-bem-online__example',
    tmpDir: 'tmp',
    examplePaths: {
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
        w: /(^desktop\.blocks((?!\/\.bem).)*$)|(^desktop\.bundles\/.*\/\w+\.bemjson.js$)/
    }
};
