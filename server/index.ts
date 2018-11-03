import * as WebSocket from "ws";
import * as uuid from "node-uuid";
import Harvester from "./Harvester";
import WebClient from "./WebClient";
import { IWebSocket } from "./types";
import * as Debug from "debug";
const debug = Debug("logio:");

const wss = new WebSocket.Server({
    port: 8080,
});

debug("Loaded");

export const harvesters = new Map();
export const clients = new Map();

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
                            debug(`payload.config: '${payload.config}' is not a JSON object`);
                        }
                        break;
                    case "initClient":
                        const client = new WebClient(ws);
                        clients.set(ws.id, client);
                        break;
                    default:
                        debug(`payload.state: '${payload.state}' is not a valid init state`);
                }
            }
        } catch (err) {
            debug("ERRRRRROOOR");
        }
    });

    ws.on("close", () => {
        if (harvesters.has(ws.id)) harvesters.delete(ws.id);
        if (clients.has(ws.id)) clients.delete(ws.id);
    });
});
