import * as fs from "fs";
import * as os from "os";
import * as Debug from "debug";
const debug = Debug("harvester:LogFile");

export default class LogFile {
    private nameSpace: string;
    private path: string;
    private newLogCb: (nameSpace: string, file: string, newLog: string) => void;
    private currSize: number;
    private watcher: fs.FSWatcher;
    constructor(nameSpace: string, path: string, newLogCb: (nameSpace: string, file: string, newLog: string) => void) {
        this.nameSpace = nameSpace;
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
            debug("File does not exist!");
            setTimeout(() => this.watch, 1000);
            return;
        }

        debug(`Watching file: ${this.path}`);

        this.currSize = fs.readFileSync(this.path, "utf8").split(os.EOL).length;
        this.watcher = fs.watch(this.path, (evt, fileName) => {
            switch (evt) {
                case "rename":
                    // File has ben rotated, start new watcher
                    this.watcher.close();
                    this.watch();
                    break;
                case "change":
                    fs.stat(this.path, (err, stat) => {
                        this.readChanges();
                    });
                    break;
            }
        });
    }

    private readChanges() {
        const rstream = fs.createReadStream(this.path, {
            encoding: "utf8",
        });
        rstream.on("data", (data) => {
            const lines = data.split(os.EOL);
            const newLines = lines.slice(this.currSize, lines.length);
            for (const line of newLines) {
                this.newLogCb(this.nameSpace, this.path, line);
            }
            this.currSize = lines.length;
        });
    }
}
