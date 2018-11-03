import { IWebSocket, IHarvesterConf } from "./types";
import { clients } from "./index";
import * as Debug from "debug";
const debug = Debug("logio:Harvester");

export default class Harvester {
    private ws: IWebSocket;
    private nodeName: string;
    private logStreams: {
        [key: string]: string[];
    };
    constructor(ws, config: IHarvesterConf) {
        debug("created harvester");
        this.ws = ws;
        this.nodeName = config.nodeName;
        this.logStreams = config.logStreams;

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
    }

    private state(state: string, payload) {
        switch (state) {
            case "newLog":
                for (const [id, client] of clients) {
                    client.newLog(payload.nameSpace, payload.file, payload.newLog);
                }
                break;
            default:
                debug(`payload.state: ${state} is not a valid state`);
        }
    }
}
