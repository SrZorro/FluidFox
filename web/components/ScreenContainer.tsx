import { Component } from "inferno";
import { style } from "typestyle";

import Screen from "./Screen";

const classMain = style({
    backgroundColor: "#000",
    width: "100%",
    height: "100%",
    padding: "5px",
    boxSizing: "border-box",
});

export default class ScreenContainer extends Component<any, any> {
    public render() {
        return (
            <div class={classMain}>
                <Screen />
            </div>
        );
    }
}
