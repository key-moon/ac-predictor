const path = require('path');

module.exports = {
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
    resolve: {
        modules: [path.resolve(__dirname, 'src')]
    },
    externals: {
        jquery: 'jQuery'
    },
    optimization: {
        minimize: false
    }
};

