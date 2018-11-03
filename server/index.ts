import * as WebSocket from 'ws';
import * as uuid from "node-uuid";

const wss = new WebSocket.Server({
    port: 8080
});

console.log("Loaded");

const harvesters = new Map();
const clients = new Map();

interface IWebSocket extends WebSocket {
    id: string
}

wss.on("connection", (ws: IWebSocket) => {
    ws.id = uuid.v4();

    ws.on("message", (msg) => {
        try {
            const payload = JSON.parse(msg.toString());

            if ("state" in payload) {
                switch (payload.state) {
                    case "initHarvester":
                        if ("config" in payload && payload.config !== null && typeof payload.config === "object") {
                            const harvester = new Harvester(ws, payload.config);
                            harvesters.set(ws.id, harvester);
                        } else {
                            console.error(`payload.config: '${payload.config}' is not a JSON object`);
                        }
                        break;
                    case "initClient":
                        const client = new WebClient(ws);
                        clients.set(ws.id, client);
                        break;
                    default:
                        console.error(`payload.state: '${payload.state}' is not a valid init state`);
                }
            }
        } catch (err) {
            console.log("ERRRRRROOOR");
        }
    })

    ws.on("close", () => {
        if (harvesters.has(ws.id))
            harvesters.delete(ws.id);
        if (clients.has(ws.id))
            clients.delete(ws.id);
    })
})

interface IHarvesterConf {
    nodeName: string;
    logStreams: {
        [key: string]: string[]
    },
}

class Harvester {
    private ws: IWebSocket;
    public nodeName: string;
    private logStreams: {
        [key: string]: string[]
    }
    constructor(ws, config: IHarvesterConf) {
        console.log("created harvester");
        this.ws = ws;
        this.nodeName = config.nodeName;
        this.logStreams = config.logStreams;

        this.ws.on("message", (data) => {
            let json;
            try {
                json = JSON.parse(data.toString());
                console.log(json);
            } catch (err) {
                console.log(err);
                return;
                // Failed in JSON parse, don't care yet
            }
            if ("state" in json) {
                this.state(json.state, json);
            }
        })
    }

    private state(state: string, payload) {
        switch (state) {
            case "newLog":
                for (const [id, client] of clients) {
                    client.newLog(payload.nameSpace, payload.file, payload.newLog);
                }
                break;
            default:
                console.error(`payload.state: ${state} is not a valid state`);
        }
    }
}

class WebClient {
    private ws: IWebSocket;
    constructor(ws) {
        this.ws = ws;
    }

    public newLog(nameSpace, file, newLog) {

    }
}