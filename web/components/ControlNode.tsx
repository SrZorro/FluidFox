import { Component } from "inferno";
import { style } from "typestyle";

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

export default class ControlNode extends Component<any, any> {
    public render() {
        const isChecked = this.props.checkState();
        return (
            <div class={classMain} style={this.props.isParent ? {
                "background-color": "#111111",
                "color": "#fff",
            } : ""}>
                <div class={classCircle} style={isChecked ? { "background-color": this.props.color } : ""}></div>
                <p>{this.props.children}</p>
                <input
                    class={classCheckBox}
                    checked={isChecked}
                    onChange={(evt) => {
                        this.props.onCheck((evt.target as HTMLInputElement).checked);
                    }}
                    type="checkbox"
                />
            </div>
        );
    }
}
