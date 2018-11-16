import * as Debug from "debug";
const debug = Debug("fluidfox:Screens");
import { Component } from "inferno";
import { inject, observer } from "inferno-mobx";
import { computed } from "mobx";
import { style } from "typestyle";
import Client, { ILog } from "../Client";

import Screen from "./Screen";
import LogLine from "./LogLine";

const classMain = style({
    backgroundColor: "#000",
    width: "100%",
    height: "100%",
    padding: "5px",
    boxSizing: "border-box",
});

@inject("FluidFox") @observer
export default class Screens extends Component<any, any> {
    @computed get logs() {
        return this.props.FluidFox.logs;
    }
    @computed get checkedMappings() {
        return this.props.FluidFox.checkedMappings;
    }
    public render() {
        const nodes = this.logs.reduce((filtered: JSX.Element[], log: ILog) => {
            if (this.checkedMappings.get(`${log.harvester}|${log.application}|${log.file}`)[0]) {
                for (const line of log.data.split("\n")) {
                    filtered.push(<LogLine
                        harvester={log.harvester}
                        harvesterColor={(this.props.FluidFox as Client).colorMapings.get(`${log.harvester}`)}
                        application={log.application}
                        applicationColor={(this.props.FluidFox as Client).colorMapings.get(`${log.harvester}|${log.application}`)}
                        file={log.file}
                        fileColor={(this.props.FluidFox as Client).colorMapings.get(`${log.harvester}|${log.application}|${log.file}`)}
                    >{line}</LogLine>);
                }
            }
            return filtered;
        }, []);
        return (
            <div class={classMain}>
                <Screen>
                    {nodes}
                </Screen>
            </div>
        );
    }
}
