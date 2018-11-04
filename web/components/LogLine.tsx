import { Component } from "inferno";
import { style } from "typestyle";
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
        return (
            <div class={classMain}>
                <p style={{ "padding-right": 5, "color": this.props.harvesterColor }}>{this.props.harvester}</p>
                <p style={{ "padding-right": 5, "color": this.props.fileColor }}>{this.props.file}</p>
                <p class={classLog}>{client.test}</p>
            </div>
        );
    }
}
