localStorage.debug = "elasticfoxweb:*";
import { render, Component } from "inferno";
import { style } from "typestyle";
import Controls from "./components/Controls";
import ScreenContainer from "./components/ScreenContainer";
import Connecting from "./components/Connecting";
import Client from "./Client";
const classMain = style({
    display: "flex",
});

const app = document.getElementById("app");

let client;

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
        console.log(this.state);
        return (
            this.state.isLoaded ? <div class={classMain}><Controls
                harvestersList={this.state.harvestersList} /><ScreenContainer /></div> : <Connecting />
        );
    }
    private reconnect() {
        client = null;
        setTimeout(() => {
            client = new Client();
            client.on("connected", () => {
                this.setState({
                    isLoaded: true,
                });
            });
            client.on("die", () => {
                this.setState({
                    isLoaded: false,
                });
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
