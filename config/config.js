module.exports = {
    exampleDir: 'try-bem-online__example',
    tmpDir: 'tmp',
    examplePaths: {
        excluded: [
            '.git',
            '.gitignore',
            '.idea',
            'README.md',
            'favicon.ico',
            'package.json'
        ],
        symlinked: [
            '.bem',
            'libs',
            'node_modules'
        ]
    }
};