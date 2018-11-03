
export interface IHarvesterConf {
    nodeName: string;
    logStreams: {
        [key: string]: string[]
    }
}

import * as WebSocket from 'ws';
export interface IWebSocket extends WebSocket {
    id: string
}