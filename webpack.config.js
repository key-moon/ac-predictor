const path = require("path");

module.exports = {
    mode: "production",
    entry: path.resolve(__dirname, "src/main.js"),
    output: {
        path: path.resolve(__dirname, "dist"),
        filename: "bundle.js"
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
                use: ["html-loader"]
            }
        ]
    },
    resolve: {
        modules: [path.resolve(__dirname, "src")]
    },
    externals: {
        jquery: "jQuery",
        moment: "moment",
        "atcoder-sidemenu": "sidemenu",
        "atcoder-userscript-libs": "usLibs",
        "atcoder-userscript-libs/src/libs/data": "usLibs.data",
        "atcoder-userscript-libs/src/libs/rating": "usLibs.rating",
        "atcoder-userscript-libs/src/libs/global": "usLibs.global",
        "atcoder-userscript-libs/src/libs/contestInformation":
            "usLibs.contestInformation"
    },
    optimization: {
        minimize: false
    }
};
