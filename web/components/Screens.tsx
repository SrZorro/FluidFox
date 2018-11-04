import { Component } from "inferno";
import { style } from "typestyle";

import Screen from "./Screen";
import LogLine from "./LogLine";

const classMain = style({
    backgroundColor: "#000",
    width: "100%",
    height: "100%",
    padding: "5px",
    boxSizing: "border-box",
});

export default class Screens extends Component<any, any> {
    public render() {
        return (
            <div class={classMain}>
                <Screen>
                    <LogLine
                        harvester="proxy1"
                        harvesterColor="#aec7e8"
                        file="zabbix.log"
                        fileColor="#2ca02c"
                    >tomate Domingo 4 de nov. de 2018 12:09:35 30648</LogLine>
                </Screen>
            </div>
        );
    }
}
