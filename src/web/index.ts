import * as express from "express";
import * as path from "path";

interface IConf {
    port: number;
    server: {
        ip: string;
        port: number;
    };
}

export default function init(conf: IConf) {
    const app = express();

    app.use("/", express.static(path.resolve(__dirname)));

    app.get("/server", (req, res) => {
        res.json(conf.server);
    });

    app.listen(conf.port, () => {
        // tslint:disable-next-line
        console.log("Listening on " + conf.port);
    });
}
