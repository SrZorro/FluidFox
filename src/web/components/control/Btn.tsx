import { Component } from "inferno";
import { style } from "typestyle";

const classMain = style({
    width: "100%",
    backgroundColor: "#000",
    textAlign: "center",
    paddingTop: 8,
    paddingBottom: 12,
    color: "#666",
    cursor: "not-allowed", // Should be 'pointer' but for now is disabled
    $nest: {
        "h1": {
            fontSize: 18,
        },
        "&:hover": {
            color: "#eee"
        }
    },
});

const classSelected = style({
    color: "#eee",
    backgroundColor: "#333",
    cursor: "default"
});

export default class Btn extends Component<any, any> {
    public render() {
        return (
            <div onClick={() => this.props.onClick(this.props.group)}
                class={[classMain, this.props.selectedGroup === this.props.group
                    ? classSelected : ""].join(" ")}><h1>{this.props.children}</h1></div>
        );
    }
}
