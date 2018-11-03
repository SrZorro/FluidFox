import * as WebSocket from "ws";
import * as Debug from "debug";
const debug = Debug("harvester:Harvester");
import LogFile from "./LogFile";
import { EventEmitter } from "events";

export interface IConfig {
    nodeName: string;
    logStreams: {
        [key: string]: string[];
    };
    server: {
        host: string;
        port: number;
    };
}

export default class Harvester extends EventEmitter {
    private ws: WebSocket;
    private logFiles: LogFile[] = [];
    constructor(config: IConfig) {
        super();
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

        this.ws.on("error", () => {
            debug("Connection error");
        });

        this.ws.on("close", () => {
            debug("Server disconnected");
            this.logFiles.map((logFile, i) => {
                this.logFiles[i].destroy();
                delete this.logFiles[i];
            });
            this.ws.removeAllListeners("open");
            this.ws.removeAllListeners("error");
            this.ws.removeAllListeners("message");
            this.ws.removeAllListeners("close");
            this.ws.close();
            this.emit("die");
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
