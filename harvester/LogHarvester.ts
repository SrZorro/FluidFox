import * as WebSocket from "ws";
import * as Debug from "debug";
const debug = Debug("harvester:Harvester");
import { config } from "./index";
import LogFile from "./LogFile";

export default class Harvester {
    private ws: WebSocket;
    private logFiles: LogFile[] = [];
    constructor() {
        this.ws = new WebSocket(`ws://${config.server.host}:${config.server.port}`);
        this.ws.on("open", () => {
            debug("connected");
            this.send({
                state: "initHarvester",
                config: {
                    nodeName: config.nodeName,
                    logStreams: config.logStreams,
                },
            });

            for (const logNamespace in config.logStreams) {
                for (const logFile of config.logStreams[logNamespace]) {
                    this.logFiles.push(new LogFile(logNamespace, logFile, this.newLog.bind(this)));
                }
            }
        });

        this.ws.on("close", () => {
            debug("Server disconnected");
            this.ws.close();
            // reconnect();
        });
    }

    private newLog(nameSpace, file, newLog) {
        this.send({
            state: "newLog",
            nameSpace,
            file,
            newLog,
        });
    }

    private send(json) {
        this.ws.send(JSON.stringify(json));
    }
}
