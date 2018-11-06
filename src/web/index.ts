import * as express from "express";
import * as path from "path";

export default function init(port) {
    const app = express();

    app.use("/", express.static(path.resolve(__dirname)));

    app.listen(port, () => {
        // tslint:disable-next-line
        console.log("Listening on " + port);
    });
}
