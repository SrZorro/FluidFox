import { Component } from "inferno";
import { style } from "typestyle";

const classMain = style({
    backgroundColor: "#111",
    border: "1px solid #333",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
});

export default class Screen extends Component<any, any> {
    public render() {
        return (
            <div class={classMain}>
                <h1>Hello world!</h1>
            </div>
        );
    }
}
