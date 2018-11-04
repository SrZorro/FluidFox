import { Component } from "inferno";
import { style } from "typestyle";

const classMain = style({
    backgroundColor: "#111",
    border: "1px solid #333",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    overflowY: "auto",
    padding: 10,
});

export default class Screen extends Component<any, any> {
    public render() {
        return (
            <div class={classMain}>
                {this.props.children}
            </div>
        );
    }
}
