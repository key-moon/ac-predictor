const path = require('path');

module.exports = {
    mode: "production",
    entry: path.resolve(__dirname, 'src/main.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    "style-loader", // creates style nodes from JS strings
                    "css-loader", // translates CSS into CommonJS
                    "sass-loader" // compiles Sass to CSS, using Node Sass by default
                ]
            },
            {
                test: /\.(html)$/,
                use: [
                    'html-loader'
                ]
            }
        ]
    },
    stats: {
        all: false,
        timings: true,
        builtAt: true,
        assets: true
    },
    resolve: {
        modules: [path.resolve(__dirname, 'src')]
    },
    externals: {
        jquery: 'jQuery',
        moment: 'moment',
        'atcoder-userscript-libs': 'usLibs'
    },
    optimization: {
        minimize: false
    }
};

