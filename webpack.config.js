const HtmlWebpackPlugin = require("html-webpack-plugin");
const LiveReloadPlugin = require("webpack-livereload-plugin");

const path = require("path");
const transformInferno = require("ts-transform-inferno").default;

module.exports = [
    Object.assign({
        target: "electron-renderer",
        entry: "./web/App.tsx",
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
                    exclude: /node_modules/
                },
                {
                    test: /\.ts$/,
                    loader: "ts-loader",
                    exclude: /node_modules/
                }
            ]
        },
        plugins: [
            new HtmlWebpackPlugin({
                template: "./web/index.html",
                inject: "body"
            }),
            new LiveReloadPlugin({
                appendScriptTag: true
            })
            // new CleanWebpackPlugin(["build"], {
            //     verbose: true
            // }),
            // By default, webpack does `n=>n` compilation with entry files. This concatenates
            // them into a single chunk.
            // new webpack.optimize.LimitChunkCountPlugin({
            //     maxChunks: 1
            // }),
            // new webpack.HotModuleReplacementPlugin()
        ]
    })
];