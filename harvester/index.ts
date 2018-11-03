import * as fs from "fs";
import Harvester from "./LogHarvester";
import { IConfig } from "./types";
import * as Debug from "debug";
const debug = Debug("harvester:index");

export const config: IConfig = JSON.parse(fs.readFileSync(`${__dirname}/harvester.json`, "utf-8"));

let harvester = new Harvester();

function reconnect() {
    harvester = null;
    debug("Waiting 1 sec for retry");
    setTimeout(() => {
        harvester = new Harvester();
    }, 1000);
}
