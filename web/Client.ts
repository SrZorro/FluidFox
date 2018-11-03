import * as Debug from "debug";
import EventEmitter from "./EventEmitter";
const debug = Debug("elasticfoxweb:Client");

export default class Client extends EventEmitter {
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

    private state(state: string, payload) {
        switch (state) {
            case "harvestersList":
                this.emit("harvestersList", payload.harvesters);
                break;
            default:
                debug(`payload.state: ${state} is not a valid state`);
        }
    }

    private send(json) {
        this.ws.send(JSON.stringify(json));
    }
}
