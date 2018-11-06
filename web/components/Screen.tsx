import { Component } from "inferno";
import { style } from "typestyle";

const classMain = style({
    backgroundColor: "#111",
    border: "1px solid #333",
    boxSizing: "border-box",
    width: "100%",
    height: "100%",
    overflowY: "scroll",
    padding: 10,
    $nest: {
        "&::-webkit-scrollbar-track": {
            boxShadow: "inset 0 0 6px rgba(0,0,0,0.3)",
            backgroundColor: "hsla(0, 0%, 50%, 1)",
        },
        "&::-webkit-scrollbar": {
            width: 6,
            backgroundColor: "#F5F5F5",
        },
        "&::-webkit-scrollbar-thumb": {
            backgroundColor: "hsla(0, 0%, 35%, 1)",
        }
    }
});

export default class Screen extends Component<any, any> {
    private screenContainer: HTMLDivElement;
    public componentDidUpdate() {
        const isScrolledToBottom = this.screenContainer.scrollHeight -
            this.screenContainer.clientHeight <= this.screenContainer.scrollTop + 50;
        if (isScrolledToBottom) {
            this.screenContainer.scrollTop = this.screenContainer.scrollHeight;
        }
    }
    public render() {
        return (
            <div ref={(node) => this.screenContainer = node} class={classMain}>
                {this.props.children}
            </div>
        );
    }
}
