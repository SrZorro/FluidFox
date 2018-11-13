#!/usr/bin/env node

import * as program from "commander";
import * as path from "path";
import * as fs from "fs";
import * as Ajv from "ajv";
import { harvesterJsonSchema } from "./confSchema";
import ElasticFox from "./server";
import Harvester from "./harvester";
import Web from "./web";

const ajv = new Ajv();

program
    .command("server <config.json>")
    .action((dir) => {
        const config = loadConfig(dir);
        if (!("port" in config)) return halt(`ERROR: config.port is not defined.`);
        if (!(typeof config.port === "number")) return halt(`ERROR: config.port is not a number.`);

        const server = new ElasticFox(config);
    });

program
    .command("harvester <config.json>")
    .action((dir) => {
        const config = loadConfig(dir);
        const validate = ajv.compile(harvesterJsonSchema);
        const valid = validate(config);
        if (!valid) halt(validate.errors);

        let harvester;

        reconnect();

        function reconnect() {
            harvester = null;
            setTimeout(() => {
                harvester = new Harvester(config);
                harvester.on("die", () => {
                    reconnect();
                });
            }, 1000);
        }

    });

program
    .command("web <config.json>")
    .action((dir) => {
        const config = loadConfig(dir);
        // Change this for ajv
        if (!("port" in config)) return halt(`ERROR: config.port is not defined.`);
        if (!(typeof config.port === "number")) return halt(`ERROR: config.port is not a number.`);
        if (!("server" in config)) return halt(`ERROR: config.server is not defined.`);
        if (!("ip" in config.server)) return halt(`ERROR: config.server.ip is not defined.`);
        if (!(typeof config.server.ip === "string")) return halt(`ERROR: config.server.ip is not a string.`);
        if (!("port" in config.server)) return halt(`ERROR: config.server.port is not defined.`);
        if (!(typeof config.server.port === "number")) return halt(`ERROR: config.server.port is not a number.`);

        Web(config);
    });

if (!process.argv.slice(2).length) {
    program.outputHelp();
}

program.parse(process.argv);

function loadConfig(file: string) {
    const fullPath = path.resolve(file);

    if (!fs.existsSync(fullPath)) halt(`ERROR: ${fullPath} does not exist.`);

    const rawConf = fs.readFileSync(fullPath, "utf8");

    let conf;
    try {
        conf = JSON.parse(rawConf);
    } catch (err) {
        return halt(`ERROR: ${fullPath} is not a valid JSON file.`);
    }
    return conf;
}

function halt(err) {
    // tslint:disable-next-line
    console.error(err);
    process.exit(1);
}
