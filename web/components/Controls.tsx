import { Component } from "inferno";
import { style } from "typestyle";

const classMain = style({
    backgroundColor: "#333",
    width: "250px",
    height: "100%",
});

export default class Controls extends Component<any, any> {
    public render() {
        return (
            <div class={classMain}>
            </div>
        );
    }
}
