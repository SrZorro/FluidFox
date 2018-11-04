import * as WebSocket from "ws";
import * as uuid from "node-uuid";
import Harvester from "./Harvester";
import WebClient from "./WebClient";
import { IWebSocket } from "./types";
import * as Debug from "debug";
const debug = Debug("elasticfox:");

export const harvesters: Map<string, Harvester> = new Map();
export const clients: Map<string, WebClient> = new Map();

interface IConfig {
    port: number;
}

export default class ElasticFox {
    private wss: WebSocket.Server;
    constructor(config: IConfig) {
        debug("Init");
        this.wss = new WebSocket.Server({
            port: config.port,
        });

        this.wss.on("listening", () => {
            debug(`Listening in port ${config.port}.`);
        });

        this.wss.on("connection", (ws: IWebSocket) => {
            ws.id = uuid.v4();

            ws.on("message", (msg) => {
                try {
                    const payload = JSON.parse(msg.toString());

                    if ("state" in payload) {
                        switch (payload.state) {
                            case "initHarvester": {

                                if ("config" in payload && payload.config !== null
                                    && typeof payload.config === "object") {
                                    const harvester = new Harvester(ws, payload.config);
                                    debug(`created harvester ${ws.id}`);
                                    harvesters.set(ws.id, harvester);

                                    // Update web clients
                                    for (const [key, client] of clients) {
                                        client.sendHarvestersList();
                                    }
                                } else {
                                    debug(`payload.config: '${payload.config}' is not a JSON object`);
                                }
                                break;
                            }
                            case "initClient": {
                                const client = new WebClient(ws);
                                debug(`created client ${ws.id}`);
                                clients.set(ws.id, client);
                                break;
                            }
                        }
                    }
                } catch (err) {
                    debug("ERRRRRROOOR");
                }
            });

            ws.on("close", () => {
                if (harvesters.has(ws.id)) {
                    harvesters.delete(ws.id);
                    debug(`Delete harvester: ${ws.id}`);
                }
                if (clients.has(ws.id)) {
                    debug(`Delete client: ${ws.id}`);
                    clients.delete(ws.id);
                }
            });
        });
    }
}
