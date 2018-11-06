const HtmlWebpackPlugin = require("html-webpack-plugin");
const EmitAllPlugin = require('webpack-emit-all-plugin');
const webpack = require("webpack");
const path = require("path");
const transformInferno = require("ts-transform-inferno").default;

module.exports = [
    Object.assign({
        target: "web",
        entry: "./src/web/App.tsx",
        output: {
            path: path.resolve(__dirname, "dist/web"),
            filename: "bundle.js"
        },
        node: {
            __dirname: false
        },
        resolve: {
            mainFields: ["main"], // Important so Webpack resolves the main field of package.json for Classcat
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        module: {
            rules: [
                {
                    test: /\.tsx$/,
                    loader: "ts-loader",
                    options: {
                        getCustomTransformers: () => ({
                            before: [transformInferno()]
                        })
                    },
                },
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./src/web/index.html",
                inject: "body"
            })
        ]
    })
];