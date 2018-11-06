import { Component } from "inferno";
import { inject, observer } from "inferno-mobx";
import { style } from "typestyle";
import Client from "../../Client";
import * as Debug from "debug";
const debug = Debug("elasticfoxweb:ControlNode");

const classMain = style({
    display: "flex",
    alignItems: "center",
    height: 28,
    borderTop: "1px solid #111",
    backgroundColor: "#222",
    color: "#d4d4d4",
    fontSize: 12,
});

const classCircle = style({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
    boxSizing: "border-box",
    marginLeft: 10,
    marginRight: 5,
});

const classCheckBox = style({
    backgroundColor: "purple",
    marginLeft: "auto",
    marginRight: 5,
});

const classDepth = [
    style({
        backgroundImage: "-webkit-linear-gradient(top, #111111, #000000)"
    }),
    style({
        backgroundColor: "#111111",
        color: "#fff",
        textDecoration: "underline"
    }),
    style({

    })
];

@inject("ElasticFox") @observer
export default class ControlNode extends Component<any, any> {
    public render() {
        const ElasticFox: Client = this.props.ElasticFox;
        const token = this.props.token;
        const isChecked = ElasticFox.checkedMappings.has(token) ? ElasticFox.checkedMappings.get(token)[0] : false;
        const color = ElasticFox.colorMapings.has(token) ? ElasticFox.colorMapings.get(token) : "black";
        return (
            <div title={this.props.tooltip ? this.props.tooltip : ""} class={[classMain, classDepth[this.props.depth]].join(" ")}>
                <div class={classCircle} style={isChecked ? { "background-color": color } : ""}></div>
                <p>{this.props.children}</p>
                <input
                    class={classCheckBox}
                    checked={isChecked}
                    onChange={(evt) => {
                        ElasticFox.ToggleLog(token, (evt.target as HTMLInputElement).checked);
                    }}
                    type="checkbox"
                />
            </div>
        );
    }
}
