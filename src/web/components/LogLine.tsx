import { Component } from "inferno";
import { style } from "typestyle";
import { SplitPath } from "../utils";
import { client } from "../App";

const classMain = style({
    display: "flex",
    fontSize: 13,
    height: 16,
});

const classLog = style({
    color: "#0c0",
});

export default class Template extends Component<any, any> {
    public render() {
        const fileName = SplitPath(this.props.file)[SplitPath(this.props.file).length - 1];
        return (
            <div class={classMain}>
                <p style={{ "padding-right": 5, "color": this.props.harvesterColor }}>{this.props.harvester}</p>
                <p style={{ "padding-right": 5, "color": this.props.applicationColor }}>{this.props.application}</p>
                <p style={{ "padding-right": 5, "color": this.props.fileColor }}>{fileName}</p>
                <p class={classLog}>{this.props.children}</p>
            </div>
        );
    }
}
