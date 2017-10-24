var path = require('path');
var CopyWebpackPlugin = require('copy-webpack-plugin');

const webpackOutput = {
    noInfo: true,
    colors: true,
    warnings: true,
    errors: true,
    chunkModules: false,
    timings: false,
    assets: false,
    version: false,
    hash: false,
    chunks: false,
    modules: false,
    reasons: false,
    children: false,
    source: false,
    errorDetails: false,
    publicPath: false
};

module.exports = {
    entry: './src/index.js',
    output: {
        filename: 'bundle.js',
        path: path.resolve(__dirname, 'dist')
    },
    module: {
        rules: [
            {
                test: /\.js$/, // include .js files
                enforce: "pre", // preload the jshint loader
                exclude: /node_modules/, // exclude any and all files in the node_modules folder
                use: [
                    {
                        loader: "jshint-loader",
                        options: {
                            reporter: require('jshint-loader-reporter')("stylish"),
                            esversion: 6,
                            camelcase: true,
                            browser: true,
                            undef: true,
                            devel: true,
                            globals: {
                                // no warnings for jasmine
                                "jasmine": true,
                                "describe": true, // prevent jshint warning for jasmine function names
                                "it": true,
                                "expect": true,
                                "beforeAll": true,
                                "beforeEach": true,
                                "afterEach": true,
                                "spyOn": true
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new CopyWebpackPlugin([
            { from: './src/index.html' },
            { from: './src/main.css' },
            { from: './src/data', to: 'data' },
            { from: './src/img', to: 'img' }
        ])
    ],
    devServer: {
        contentBase: path.join(__dirname, "dist"),
        compress: true,
        port: 9000,
        //stats: "errors-only"
        stats: webpackOutput
    },
    devtool: "inline-source-map"
};