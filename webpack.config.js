const path = require('path');

module.exports = {
    entry: path.resolve(__dirname, 'ac-predictor/main.js'),
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
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

