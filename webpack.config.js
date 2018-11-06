const HtmlWebpackPlugin = require("html-webpack-plugin");
const LiveReloadPlugin = require("webpack-livereload-plugin");
const webpack = require("webpack");

const path = require("path");
const transformInferno = require("ts-transform-inferno").default;

module.exports = [
    Object.assign({
        target: "node",
        entry: "./src/index.ts",
        output: {
            path: path.resolve(__dirname, "dist"),
            filename: "index.js"
        },
        devtool: false,
        plugins: [
            new webpack.SourceMapDevToolPlugin({})
        ],
        node: {
            __dirname: false
        },
        resolve: {
            extensions: [".js", ".jsx", ".ts", ".tsx"]
        },
        module: {
            rules: [
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                }
            ]
        }
    }),
    Object.assign({
        target: "web",
        entry: "./src/web/App.tsx",
        mode: "development",
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