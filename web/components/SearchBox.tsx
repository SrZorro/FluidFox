import { Component } from "inferno";
import { style } from "typestyle";

const classMain = style({
    width: "100%",
    height: 45,
    padding: 8,
    boxSizing: "border-box",
});

const classInput = style({
    backgroundColor: "#111",
    border: "1px solid #000",
    color: "#ccc",
    paddingLeft: 8,
    fontSize: "12px",
    width: "100%",
    height: "100%",
});

export default class SearchBox extends Component<any, any> {
    public render() {
        return (
            <div class={classMain}>
                <input class={classInput} placeholder="Filter..." type="text" onInput={(evt) => {
                    if (this.props.onSearch) this.props.onSearch((evt.target as HTMLInputElement).value);
                }} />
            </div>
        );
    }
}
