import * as express from "express";
import * as path from "path";

export default function init(port) {
    const app = express();

    /* serves main page */
    // app.get("/", (req, res) => {
    //     res.sendFile(path.resolve(__dirname, "web/index.html"));
    // });

    // /* serves all the static files */
    // app.get(/^(.+)$/, (req, res) => {
    //     console.log('static file request : ' + req.params);
    //     res.sendFile(path.resolve(__dirname, "web", req.params[0]));
    // });
    app.use("/", express.static(path.resolve(__dirname, "web")));

    app.listen(port, () => {
        console.log("Listening on " + port);
    });
}
