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
    resolve: {
        modules: [path.resolve(__dirname, 'src')]
    },
    externals: {
        jquery: 'jQuery',
        moment: 'moment',

        //AtCoder's Global Variables
        LANG: "LANG",
        userScreenName: 'userScreenName',
        //only contest page
        contestScreenName: 'typeof contestScreenName !== "undefined" ? contestScreenName : ""',
        startTime: 'typeof startTime !== "undefined" ? startTime : ""',
        endTime: 'typeof endTime !== "undefined" ? endTime : ""',

        //utils.js
        has: "has",

        arrayToSet: "arrayToSet",
        setToArray: "setToArray",

        setCookie: "setCookie",
        getCookie: "getCookie",
        getCookieBool: "getCookieBool",
        delCookie: "delCookie",

        setLS: "setLS",
        getLS: "getLS",
        delLS: "delLS",

        getServerTime: "getServerTime",

        rand: "rand",

        copy: "copy",

        storeFavs: "storeFavs",
        reloadFavs: "reloadFavs",
        toggleFav: "toggleFav",
    },
    optimization: {
        minimize: false
    }
};

