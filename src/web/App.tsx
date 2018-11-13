localStorage.debug = "elasticfoxweb:*";
import { render, Component } from "inferno";
import { Provider } from "inferno-mobx";
import { style } from "typestyle";
import Controls from "./components/control/Controls";
import ScreenContainer from "./components/Screens";
import Connecting from "./components/Connecting";
import Client from "./Client";
import * as Debug from "debug";
const debug = Debug("elasticfoxweb:");

const classMain = style({
    width: "100%",
    height: "100%",
    display: "flex",
    flexFlow: "row",
});

const app = document.getElementById("app");

export let client;

export default class Main extends Component<any, any> {
    private client;
    constructor() {
        super();
        this.state = {
            isLoaded: false,
            harvestersList: [],
        };

        this.reconnect();
    }
    public render() {
        return (
            this.state.isLoaded ?
                <Provider ElasticFox={client}>
                    <div class={classMain}>
                        <Controls />
                        <ScreenContainer />
                    </div>
                </Provider>
                : <Connecting />
        );
    }
    private reconnect() {
        client = null;
        setTimeout(() => {
            client = new Client();
            // @ts-ignore
            window.client = client;
            client.on("connected", () => {
                this.setState({
                    isLoaded: true,
                });
            });
            client.on("die", () => {
                this.setState({
                    isLoaded: false,
                });
                debug("Retrying connection...");
                this.reconnect();
            });
            client.on("harvestersList", (harvestersList) => {
                this.setState({
                    harvestersList,
                });
            });
        }, 1000);
    }
}

render(<Main />, app);
