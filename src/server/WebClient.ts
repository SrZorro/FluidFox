import * as Debug from "debug";
const debug = Debug("fluidfox:Client");
import { IWebSocket } from "./types";
import { harvesters } from "./FluidFox";

export default class WebClient {
    private ws: IWebSocket;
    constructor(ws) {
        this.ws = ws;

        this.sendHarvestersList();

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

    public SendLog(payload) {
        this.send(payload);
    }

    public sendHarvestersList() {
        const response = {};
        for (const [key, harvester] of harvesters) {
            debug(harvester.logStreams);
            response[harvester.nodeName] = harvester.logStreams;
        }
        this.send({
            state: "harvestersList",
            harvesters: response,
        });
    }

    private send(json) {
        this.ws.send(JSON.stringify(json));
    }

    private state(state: string, payload) {
        switch (state) {
            case "fetchPastLogs":
                const request: {
                    state: "fetchPastLogs", harvester: string, application: string,
                    file: string, offsetEnd: number
                } = payload;
                harvesters.forEach((harvester) => {
                    if (harvester.nodeName === request.harvester) {
                        harvester.Send(request);
                    }
                });
                break;
            default:
                debug(`payload.state: ${state} is not a valid state`);
        }
    }
}
