import { Component } from "inferno";
import { style } from "typestyle";

const classMain = style({
    backgroundColor: "pink",
});

export default class Template extends Component<any, any> {
    public render() {
        return (
            <div class={classMain}>
                <h1>Connecting...</h1>
            </div>
        );
    }
}
