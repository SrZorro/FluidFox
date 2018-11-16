import { IWebSocket, IHarvesterConf } from "./types";
import { clients } from "./FluidFox";
import * as Debug from "debug";
const debug = Debug("fluidfox:Harvester");

export default class Harvester {
    public nodeName: string;
    public logStreams: {
        [key: string]: string[];
    };
    private ws: IWebSocket;
    constructor(ws, config: IHarvesterConf) {
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

    public Send(json) {
        this.ws.send(JSON.stringify(json));
    }

    private state(state: string, payload) {
        switch (state) {
            case "logBlop":
                for (const [id, client] of clients) {
                    client.SendLog({ ...payload, harvester: this.nodeName });
                }
                break;
            default:
                debug(`payload.state: ${state} is not a valid state`);
        }
    }
}
