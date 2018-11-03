localStorage.debug = "logioweb:*";
import { render } from "inferno";
import { style } from "typestyle";
import Controls from "./components/Controls";
import ScreenContainer from "./components/ScreenContainer";
const classMain = style({
    display: "flex",
});

const app = document.getElementById("app");

render(<div class={classMain}>
    <Controls />
    <ScreenContainer />
</div>, app);
