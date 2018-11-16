import * as WebSocket from "ws";
import * as Debug from "debug";
const debug = Debug("fluidfox:Harvester");
import LogFile from "./LogFile";
import { EventEmitter } from "events";

export interface IConfig {
    nodeName: string;
    logStreams: {
        [key: string]: string[] | {
            file: string;
            name: string;
        }
    };
    server: {
        host: string;
        port: number;
    };
}

export interface ILog {
    application: string;
    file: string;
    data: string;
    offset: {
        start: number;
        end: number;
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

            for (const applicationName in config.logStreams) {
                for (const i in config.logStreams[applicationName]) {
                    const obj = config.logStreams[applicationName][i];
                    const filePath = typeof obj === "string" ? obj : obj.file;
                    this.logFiles.push(new LogFile(applicationName, filePath, this));
                }
            }
        });

        this.ws.on("message", (data) => {
            let json;
            try {
                json = JSON.parse(data.toString());
                debug(json);
            } catch (err) {
                debug(err);
                return;
                // Failed in JSON parse, don't care yet
            }
            if ("state" in json) {
                this.state(json.state, json);
            }
        });

        this.ws.on("error", () => {
            debug("Connection error");
        });

        this.ws.on("close", () => {
            debug("Server disconnected");
            this.logFiles.map((logFile, i) => {
                this.logFiles[i].Destroy();
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

    public NewLog(log: ILog) {
        debug("test");
        this.send({
            state: "logBlop",
            ...log
        });
    }

    private state(state: string, payload) {
        switch (state) {
            case "fetchPastLogs":
                const request: {
                    state: "fetchPastLogs", harvester: string, application: string,
                    file: string, offsetEnd: number
                } = payload;
                debug(payload);
                this.logFiles.forEach((logFile) => {
                    if (logFile.Application === request.application && logFile.Path === request.file) {
                        logFile.FetchPastLogs(request.offsetEnd);
                    }
                });
                break;
            default:
                debug(`payload.state: ${state} is not a valid state`);
        }
    }

    private send(json) {
        this.ws.send(JSON.stringify(json));
    }
}
