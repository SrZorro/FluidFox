import * as Debug from "debug";
const debug = Debug("fluidfox:Client");
import { observable } from "mobx";
import { EventEmitter } from "events";

export interface ILog {
    application: string;
    harvester: string;
    file: string;
    data: string;
    offset: {
        start: number;
        end: number;
    };
}
interface IServerConf {
    ip: string;
    port: number;
}
export default class Client extends EventEmitter {
    @observable public logs: ILog[] = [];
    @observable public colorMapings: Map<string, string> = new Map();
    @observable public checkedMappings: Map<string, boolean[]> = new Map();
    @observable public harvesters: {
        [harvester: string]: {
            [application: string]: string[] | Array<{
                name: string;
                file: string;
            }>
        }
    } = {};
    private logBounds: Map<string, { start: number; end: number }> = new Map();
    private ws: WebSocket;
    constructor() {
        super();
        debug("Client inited");
        fetch("/server").then((resp) => {
            debug("Recived server config from web server");
            return resp.json();
        }).then((serverConf: IServerConf) => {
            debug("Starting connection");
            this.ws = new WebSocket(`ws://${serverConf.ip}:${serverConf.port}`);
            this.ws.onopen = () => {
                debug("connected");
                this.emit("connected");
                this.send({
                    state: "initClient",
                });
            };

            this.ws.onerror = () => {
                debug("Server connection failed");
            };

            this.ws.onclose = () => {
                debug("Server disconnected");
                this.ws.onclose = undefined;
                this.ws.onerror = undefined;
                this.ws.onopen = undefined;
                this.ws.onmessage = undefined;
                this.ws.close();
                this.emit("die");
            };

            this.ws.onmessage = (data) => {
                let json;
                try {
                    json = JSON.parse(data.data.toString());
                    // debug(json);
                } catch (err) {
                    debug(err);
                    return;
                    // Failed in JSON parse, don't care yet
                }
                if ("state" in json) {
                    this.state(json.state, json);
                }
            };
        }).catch(() => {
            window.location.reload();
        });
    }

    public ToggleLog(key: string, isVisible: boolean) {
        const nChecks = this.checkedMappings;
        const harvesterName = key.split("|")[0];
        const applicationName = key.split("|").length >= 1 ? key.split("|")[1] : null;
        const log = key.split("|").length >= 2 ? key.split("|")[2] : null;

        if (this.checkedMappings.has(key)) this.checkedMappings.set(key, [isVisible]);

        // If toggle harvester, all applications and logs toggle to same
        if (key.split("|").length === 1) {
            nChecks.forEach((v, cKey) => {
                if (cKey.startsWith(harvesterName)) nChecks.set(cKey, [isVisible]);
            });
        }

        // If toggle application, all logs toggle to same
        if (key.split("|").length === 2) {
            nChecks.forEach((v, cKey) => {
                // Remove harvester from key
                const cKeyWithoutHarvester = cKey.split("|").splice(1, cKey.split("|").length - 1).join("|");
                if (cKeyWithoutHarvester.startsWith(applicationName)) nChecks.set(cKey, [isVisible]);
            });
        }

        let childs = [];
        // If atleast one log is off, disable application
        if (key.split("|").length === 3) {
            childs = [];
            nChecks.forEach((v, cKey) => {
                if (cKey.startsWith(`${harvesterName}|${applicationName}`) && !(cKey === `${harvesterName}|${applicationName}`)) {
                    childs.push(v[0]);
                }
            });
            nChecks.set(`${harvesterName}|${applicationName}`, [childs.every((v) => v)]);
        }

        // If atleast one application or log is off, disable harvester
        childs = [];
        nChecks.forEach((v, cKey) => {
            if (cKey.startsWith(harvesterName) && !(cKey === harvesterName)) {
                childs.push(v[0]);
            }
        });
        nChecks.set(harvesterName, [childs.every((v) => v)]);
    }

    public RequestLogHistory() {
        for (const harvester in this.harvesters) {
            for (const application in this.harvesters[harvester]) {
                for (const obj of this.harvesters[harvester][application]) {
                    const file = typeof obj === "string" ? obj : obj.file;
                    const key = `${harvester}|${application}|${file}`;
                    debug("Fetch past history");
                    this.send({
                        state: "fetchPastLogs",
                        harvester, application, file,
                        offsetEnd: this.logBounds.has(key) ? this.logBounds.get(key).end : null
                    });
                }

            }
        }
    }

    private state(state: string, payload) {
        switch (state) {
            case "harvestersList":
                debug("recived harvesters");
                this.harvesters = payload.harvesters;
                this.generateColors();
                this.updateCheckboxList();
                break;
            case "logBlop":
                delete payload.state;
                const log = payload as ILog;
                const key = `${log.harvester}|${log.application}|${log.file}`;
                const currOffset: { start: number; end: number } = this.logBounds.has(key) ?
                    this.logBounds.get(key) : { start: null, end: null };

                debug(`log.end: ${log.offset.end} <= ${currOffset.start} curStart ${log.offset.end <= currOffset.start}`);
                if ((currOffset.start === null && currOffset.end === null)) {
                    debug("unshift");
                    this.logs.unshift(log);
                    currOffset.start = log.offset.start;
                    currOffset.end = currOffset.end === null ? log.offset.end : currOffset.end;
                } else if (log.offset.start >= currOffset.end) {
                    debug("push");
                    this.logs.push(log);
                    currOffset.start = currOffset.start === null ? log.offset.start : currOffset.start;
                    currOffset.end = log.offset.end;
                } else {
                    alert("This should never happen");
                    debug("This should never happen");
                }
                debug(currOffset);
                this.logBounds.set(key, currOffset);
                break;
            default:
                debug(`payload.state: ${state} is not a valid state`);
        }
    }

    private updateCheckboxList() {
        const existingKeys = Array.from(this.checkedMappings.keys());
        function remove(arr, key) {
            const index = arr.indexOf(key);
            arr.splice(index, 1);
        }
        const work = (key: string) => {
            // Check if already exists, if it does, remove from pool and return
            if (this.checkedMappings.has(key)) {
                remove(existingKeys, key);
                return;
            }

            // Don't exist? Then add it, default to true
            this.checkedMappings.set(key, [true]);
        };

        for (const [harvesterName, harvester] of Object.entries(this.harvesters)) {
            work(harvesterName);
            for (const [appName, app] of Object.entries(harvester)) {
                work(`${harvesterName}|${appName}`);
                for (const obj of app) {
                    const file = typeof obj === "string" ? obj : obj.file;
                    work(`${harvesterName}|${appName}|${file}`);
                }
            }
        }
        // We are done, if there are more keys in existingKeys,
        // we can remove it as this one don't exist anymore
        existingKeys.forEach((key) => {
            this.checkedMappings.delete(key);
        });
    }

    private generateColors() {
        const colors = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
            "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2",
            "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5",
        ];
        this.colorMapings.clear();
        let itinerator = 0;
        const work = (key: string) => {
            this.colorMapings.set(key, colors[itinerator < colors.length ? itinerator++ : itinerator = 0]);
        };

        for (const [harvesterName, harvester] of Object.entries(this.harvesters)) {
            work(harvesterName);
            for (const [appName, app] of Object.entries(harvester)) {
                work(`${harvesterName}|${appName}`);
                for (const obj of app) {
                    const file = typeof obj === "string" ? obj : obj.file;
                    work(`${harvesterName}|${appName}|${file}`);
                }
            }
        }
    }

    private send(json) {
        this.ws.send(JSON.stringify(json));
    }
}
