export interface IConfig {
    nodeName: string;
    logStreams: {
        [key: string]: string[];
    };
    server: {
        host: string;
        port: number;
    };
}