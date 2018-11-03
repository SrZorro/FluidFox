import * as WebSocket from "ws";
import * as fs from "fs";
import * as os from "os";

interface IConfig {
    nodeName: string;
    logStreams: {
        [key: string]: string[]
    },
    server: {
        host: string;
        port: number;
    }
}

const config: IConfig = JSON.parse(fs.readFileSync(`${__dirname}/harvester.json`, "utf-8"));

class Harvester {
    private ws: WebSocket;
    private logFiles: LogFile[] = [];
    constructor() {
        this.ws = new WebSocket(`ws://${config.server.host}:${config.server.port}`);
        this.ws.on("open", () => {
            console.log("connected");
            this.send({
                state: "initHarvester",
                config: {
                    nodeName: config.nodeName,
                    logStreams: config.logStreams
                }
            })

            for (const logNamespace in config.logStreams) {
                for (const logFile of config.logStreams[logNamespace]) {
                    this.logFiles.push(new LogFile(logNamespace, logFile, this.newLog.bind(this)))
                }
            }
        })

        this.ws.on("close", () => {
            console.log("Server disconnected");
            this.ws.close();
            reconnect();
        })
    }

    private newLog(nameSpace, file, newLog) {
        this.send({
            state: "newLog",
            nameSpace,
            file,
            newLog
        })
    }

    private send(json) {
        this.ws.send(JSON.stringify(json));
    }
}

class LogFile {
    private nameSpace: string;
    private path: string;
    private newLogCb: (nameSpace: string, file: string, newLog: string) => void;
    private currSize: number;
    constructor(nameSpace: string, path: string, newLogCb: (nameSpace: string, file: string, newLog: string) => void) {
        this.nameSpace = nameSpace;
        this.path = path;
        this.newLogCb = newLogCb;

        this.watch();
    }

    private watch() {
        if (!fs.existsSync(this.path)) {
            console.log("File does not exist!");
            setTimeout(() => this.watch, 1000);
            return;
        }

        console.log(`Watching file: ${this.path}`);

        this.currSize = fs.readFileSync(this.path, "utf8").split(os.EOL).length;
        const watcher = fs.watch(this.path, (evt, fileName) => {
            switch (evt) {
                case "rename":
                    // File has ben rotated, start new watcher
                    watcher.close();
                    this.watch();
                    break;
                case "change":
                    fs.stat(this.path, (err, stat) => {
                        this.readChanges();
                    })
                    break;
            }
        });
    }

    private readChanges() {
        const rstream = fs.createReadStream(this.path, {
            encoding: "utf8"
        });
        rstream.on("data", (data) => {
            const lines = data.split(os.EOL);
            const newLines = lines.slice(this.currSize, lines.length);
            for (const line of newLines) {
                this.newLogCb(this.nameSpace, this.path, line);
            }
            this.currSize = lines.length;
        })
    }
}

let harvester = new Harvester();

function reconnect() {
    harvester = null;
    console.log("Waiting 1 sec for retry");
    setTimeout(() => {
        harvester = new Harvester();
    }, 1000);
}