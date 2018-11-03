import { IWebSocket } from "./types";

export default class WebClient {
    private ws: IWebSocket;
    constructor(ws) {
        this.ws = ws;
    }

    public newLog(nameSpace, file, newLog) {
        // ToDo
    }
}
