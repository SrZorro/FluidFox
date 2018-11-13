import { Component } from "inferno";
import { inject, observer } from "inferno-mobx";
import { style } from "typestyle";
import SearchBox from "./SearchBox";
import Btn from "./Btn";
import ControlNode from "./ControlNode";
import { SplitPath } from "../../utils";
import * as Debug from "debug";
const debug = Debug("fluidfox:Controls");

const classMain = style({
    backgroundColor: "#333",
    minWidth: "250px",
    maxWidth: "250px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
});

const classButtons = style({
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between"
});

const classLogs = style({
    height: "100%",
    width: "100%",
});

interface IControlsState {
    selectedGroup: IGroupTypes;
}

type IGroupTypes = "server" | "app" | "log";

@inject("FluidFox") @observer
export default class Controls extends Component<any, IControlsState> {
    constructor() {
        super();
        this.state = {
            selectedGroup: "server"
        };
    }
    public render() {
        const nodes = [];
        let token = "";
        const harvesters = this.props.FluidFox.harvesters;

        for (const [harvesterName, harvester] of Object.entries(harvesters)) {
            token = harvesterName;
            nodes.push(<ControlNode token={token} depth={0}>{harvesterName}</ControlNode>);

            for (const [appName, app] of Object.entries(harvester)) {
                token = `${harvesterName}|${appName}`;
                nodes.push(<ControlNode token={token} depth={1}>{appName}</ControlNode>);

                for (const obj of app) {
                    const file = typeof obj === "string" ? obj : obj.file;
                    const fileName = SplitPath(file)[SplitPath(file).length - 1];
                    token = `${harvesterName}|${appName}|${file}`;
                    const displayText = typeof obj === "string" ? fileName : obj.name;
                    const tooltip = obj.name ? fileName : "";
                    nodes.push(<ControlNode tooltip={tooltip} token={token} depth={2}>{displayText}</ControlNode>);
                }
            }
        }

        return (
            <div class={classMain}>
                <div class={classButtons}>
                    <Btn selectedGroup={this.state.selectedGroup}
                        group="server"
                        onClick={this.changeGroup.bind(this)}>
                        Servers
                    </Btn>
                    <Btn selectedGroup={this.state.selectedGroup}
                        group="app"
                        onClick={() => {/*void*/ }}>
                        Apps
                    </Btn>
                    <Btn selectedGroup={this.state.selectedGroup}
                        group="log"
                        onClick={() => {/*void*/ }}>
                        logs
                    </Btn>
                </div>
                <SearchBox />
                <div class={classLogs}>
                    {nodes}
                </div>
            </div>
        );
    }

    private changeGroup(group: IGroupTypes) {
        this.setState({
            selectedGroup: group
        });
    }
}
