import * as fs from "fs";
import * as os from "os";
import * as chokidar from "chokidar";
import * as Debug from "debug";
const debug = Debug("fluidfox:LogFile");

export default class LogFile {
    private application: string;
    private path: string;
    private newLogCb: (application: string, file: string, newLog: string) => void;
    private currSize: number;
    private watcher: fs.FSWatcher;
    constructor(application: string, path: string, newLogCb: (application: string, file: string, newLog: string) => void) {
        this.application = application;
        this.path = path;
        this.newLogCb = newLogCb;

        this.watch();
    }

    public destroy() {
        this.watcher.close();
        this.newLogCb = () => { /* void */ };
    }

    private watch() {
        if (!fs.existsSync(this.path)) {
            debug(`File ${this.path} does not exist!`);
            setTimeout(() => this.watch(), 1000);
            return;
        }

        debug(`Watching file: ${this.path}`);

        let prevSize = fs.statSync(this.path).size;
        this.watcher = chokidar.watch(this.path);

        this.watcher.on("unlink", (path) => {
            // File has ben rotated, start new watcher
            this.watcher.close();
            this.watch();
        });

        this.watcher.on("change", (path, stat) => {
            const stats = ((stat as unknown) as fs.Stats);
            debug(`prev: ${prevSize} curr: ${stats.size}`);
            this.readChanges(stats.size, prevSize);
            prevSize = stats.size;
        });
    }

    private readChanges(curr, prev) {
        if (curr < prev) return;
        const rstream = fs.createReadStream(this.path, {
            encoding: "utf8",
            start: prev,
            end: curr,
        });
        rstream.on("data", (data) => {
            const lines = data.split(os.EOL);
            if (lines[0] === "") lines.shift();
            if (lines[lines.length - 1] === "") lines.pop();
            debug(lines);
            for (const line of lines) {
                this.newLogCb(this.application, this.path, line);
            }
        });
    }
}
