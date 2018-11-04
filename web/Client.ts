import * as Debug from "debug";
const debug = Debug("elasticfoxweb:Client");
import { observable } from "mobx";
import EventEmitter from "./EventEmitter";

// {
//     "pg1": {
//         "postgres": [
//             "/var/log/postgres.log",
//             "/var/log/patroni.log"
//         ],
//             "zabbix": [
//                 "/var/log/zabbix_agent.log"
//             ]
//     },
//     "pg2": {
//         "postgres": [
//             "/var/log/postgres.log",
//             "/var/log/patroni.log"
//         ],
//             "zabbix": [
//                 "/var/log/zabbix_agent.log"
//             ]
//     },
//     "proxy": {
//         "nginx": [
//             "/var/log/nginx/access.log",
//             "/var/log/nginx/error.log"
//         ],
//             "zabbix": [
//                 "/var/log/zabbix_agent.log"
//             ]
//     },
//     "multi1": {
//         "zabbix_server": [
//             {
//                 "name": "zabbix server",
//                 "file": "/var/log/zabbix_server.log"
//             }
//         ],
//             "zabbix": [
//                 "/var/log/zabbix_agent.log"
//             ]
//     }
// }

export default class Client extends EventEmitter {
    @observable public test = "";
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
    private ws: WebSocket;
    constructor() {
        super();
        debug("Client inited");
        this.ws = new WebSocket(`ws://127.0.0.1:28777`);
        this.ws.onopen = () => {
            debug("connected");
            this.emit("connected");
            this.send({
                state: "initClient",
            });
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
                debug(json);
            } catch (err) {
                debug(err);
                return;
                // Failed in JSON parse, don't care yet
            }
            if ("state" in json) {
                this.state(json.state, json);
            }
        };
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

    private state(state: string, payload) {
        switch (state) {
            case "harvestersList":
                debug("recived harvesters");
                this.harvesters = payload.harvesters;
                // this.harvesters = {
                //     pg1: {
                //         postgres: [
                //             "/var/log/postgres.log",
                //             "/var/log/patroni.log"
                //         ],
                //         zabbix: [
                //             "/var/log/zabbix_agent.log"
                //         ]
                //     },
                //     pg2: {
                //         postgres: [
                //             "/var/log/postgres.log",
                //             "/var/log/patroni.log"
                //         ],
                //         zabbix: [
                //             "/var/log/zabbix_agent.log"
                //         ]
                //     },
                //     proxy: {
                //         nginx: [
                //             "/var/log/nginx/access.log",
                //             "/var/log/nginx/error.log"
                //         ],
                //         zabbix: [
                //             "/var/log/zabbix_agent.log"
                //         ]
                //     },
                //     multi1: {
                //         zabbix_server: [
                //             {
                //                 name: "zabbix server",
                //                 file: "/var/log/zabbix_server.log"
                //             }
                //         ],
                //         zabbix: [
                //             "/var/log/zabbix_agent.log"
                //         ]
                //     }
                // };
                this.generateColors();
                this.updateCheckboxList();
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
