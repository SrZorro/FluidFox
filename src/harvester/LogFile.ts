import * as fs from "fs";
import * as os from "os";
import * as chokidar from "chokidar";
import * as Debug from "debug";
import Harvester from "./LogHarvester";
const debug = Debug("fluidfox:LogFile");

const PAST_FETCH_OFFSET = 100;

export default class LogFile {
    public Application: string;
    public Path: string;
    private harvester: Harvester;
    private watcher: fs.FSWatcher;
    constructor(application: string, path: string, harvester: Harvester) {
        this.Application = application;
        this.Path = path;
        this.harvester = harvester;

        this.watch();
    }

    public Destroy() {
        this.watcher.close();
    }

    public FetchPastLogs(offsetEnd: number) {
        offsetEnd = offsetEnd === null ? fs.statSync(this.Path).size : offsetEnd;
        let offsetStart = offsetEnd - PAST_FETCH_OFFSET >= 0 ? offsetEnd - PAST_FETCH_OFFSET : 0;
        this.readfromTo(offsetStart, offsetEnd, (data) => {
            // Remove first line because it will be incomplete
            const lines = data.split(os.EOL);
            if (lines.length >= 2) {
                offsetStart = offsetStart - Buffer.byteLength(lines.shift(), "utf8");
                this.newLog(lines.join(os.EOL), offsetStart, offsetEnd);
            }
        });
    }

    private watch() {
        if (!fs.existsSync(this.Path)) {
            debug(`File ${this.Path} does not exist!`);
            setTimeout(() => this.watch(), 1000);
            return;
        }

        debug(`Watching file: ${this.Path}`);

        let prevStart = fs.statSync(this.Path).size;
        this.watcher = chokidar.watch(this.Path);

        this.watcher.on("unlink", (path) => {
            // File has ben rotated, start new watcher
            this.watcher.close();
            this.watch();
        });

        this.watcher.on("change", (path, stat) => {
            const stats = ((stat as unknown) as fs.Stats);
            debug(`from: ${prevStart} to: ${stats.size}`);
            const start = prevStart;
            this.readfromTo(start, stats.size, (data) => {
                this.newLog(data, prevStart, stats.size);
            });
            prevStart = stats.size;
        });
    }

    private readfromTo(start: number, end: number, cb: (data: string) => void) {
        if (end <= start) return;
        const rstream = fs.createReadStream(this.Path, {
            encoding: "utf8",
            start,
            end,
        });
        rstream.on("data", (data) => {
            cb(data);
        });
    }
    private newLog(data: string, start: number, end: number) {
        this.harvester.NewLog({
            application: this.Application,
            data: data.slice(0, -1),
            file: this.Path,
            offset: {
                start,
                end
            }
        });
    }
}
