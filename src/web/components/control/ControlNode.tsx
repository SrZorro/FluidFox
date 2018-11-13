import { Component } from "inferno";
import { inject, observer } from "inferno-mobx";
import { style } from "typestyle";
import Client from "../../Client";
import * as Debug from "debug";
const debug = Debug("fluidfox:ControlNode");

const classMain = style({
    display: "flex",
    alignItems: "center",
    height: 28,
    borderTop: "1px solid #111",
    backgroundColor: "#222",
    color: "#d4d4d4",
    fontSize: 12,
});

const classCircle = style({
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#555",
    boxSizing: "border-box",
    marginLeft: 10,
    marginRight: 5,
});

const classCheckBox = style({
    backgroundColor: "purple",
    marginLeft: "auto",
    marginRight: 5,
});

const classDepth = [
    style({
        backgroundImage: "-webkit-linear-gradient(top, #111111, #000000)"
    }),
    style({
        backgroundColor: "#111111",
        color: "#fff",
        textDecoration: "underline"
    }),
    style({

    })
];

/* tslint:disable:max-line-length */
const classIcon = [
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAYAAABzenr0AAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAytJREFUeNrEV89PGlEQHmD5uetCmjShPYgSD1YNNiQNwaYn48Wj4eLJg/+DFy9N2iNnb5r+Az010ZNHe8CEg2namBi1RJogjUBBERG273uwDay7srvQ+CWTt+zOm/e9eTPzBoeiKNQLB8Pm5uZFMBh82W63aRRgJiHVjY2NEFuvz6igN+Hk5GQsnU6TJEnUS8LpdBIIQ/Aewt79YaOMb5DuYg/mbW1tjeGRyWACWACTGo3GwN21Wi25O3LpRaFQoPv7ewqHwyohh3a+YGT45uaGXC6XbbdjE9lslhNIJpOkPeqBHsDu4YVhEIvF6O7u7lE7ugQikYj39PSURoVisUg+n4/vzRSBXC7XiMfjHkEQRkLg+vqaMpkMaQPQkACL4jZYi6JIsizbOgocY7Va5Yt7vV6eGaY8wCYqq6ur3GWIakQyjMEbeBcIBFRjfWg2m1wQOxgR9UdHR/xbIpFQU1gx6wEevW63mwuM4XelUqGrq6t/OQ6jIAl9PCNrMIIs5PDwkMrlMs3MzFgLQvXcsLgW6iKqm1Ud1Ssgh8gH1tbW7GVBNBr1d4NmZEBVNU2ApWB9cXFxZFkA7O/vWzuCiYkJ8ng8Qy2az+d5UMKW5RhQL5thSvHe3h4P0pWVFesE6vU6j/xhMDs7y6ug3++3TqBWq+lmgRVMTk5ygS3LBFDFRhmElgiws2dd0fvBqcVyPPXtO32Kvx6om0y+MU8ARWVMDnYKUqRKxXe/6PnBCxLP5D69wO1tn+5jMOotDHzsYJdQx+hZ6gflF86pNl+hhQ9LfVp+wc0JyKYICNY8IEkif371dZ68io/Gs9EH1UxielPsgjswqHK2PYCyLomBziK/IzT+JdL5IPbrPVNa9NbRpM9d3ccJOM0TmJ6ePg+FQrGBDWmpTB9dPnbbTZkpTBeGFcuuYDojq6RSKcWuDUGvubD758MOnPTEcBj1671YX18vs+FBru3s7CBeaG5ujveOOqhsb2+HTFfC3d3dcTb81CpdXl7q/ktaWurUBbRqEC1YMxpkNrU7DC0vL1d0CZRKJV2Wx8fHdMuqnlWgiTWyaekI/ieePAj/CjAA6Fa0Kzi6ufIAAAAASUVORK5CYII=",
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgBAMAAACBVGfHAAAAHlBMVEXAwMAAAAAAAP8EBAT/////AAD//wAA////AP+AgACf2Q+fAAAAAXRSTlMAQObYZgAAAIdJREFUeNpjYKACYFJCAioqQAHVoDAVMM8pCIgxVAgwMBmDgaEgGAhhFXAv7jBONkwUk2jEpSLN2NnY2dBRUAQIsaoQRAZggTRBR8FAQcdEmBZMFS6ChYlANYniOFVgCLgXhgYGigqKigbisxa/GUBrQQ6TFJcUJNJaJRQgwMCAokJQgBpRCwAbWSp8nlMjWwAAAABJRU5ErkJggg==",
    "data:image/png;base64,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"
];
/* tslint:enable:max-line-length */

@inject("FluidFox") @observer
export default class ControlNode extends Component<any, any> {
    public render() {
        const FluidFox: Client = this.props.FluidFox;
        const token = this.props.token;
        const isChecked = FluidFox.checkedMappings.has(token) ? FluidFox.checkedMappings.get(token)[0] : false;
        const color = FluidFox.colorMapings.has(token) ? FluidFox.colorMapings.get(token) : "black";
        return (
            <div title={this.props.tooltip ? this.props.tooltip : ""} class={[classMain, classDepth[this.props.depth]].join(" ")}>
                <img src={classIcon[this.props.depth]} style={{ "width": "16px", "margin-left": "5px" }} alt="" />
                <div class={classCircle} style={isChecked ? { "background-color": color } : ""}></div>
                <p>{this.props.children}</p>
                <input
                    class={classCheckBox}
                    checked={isChecked}
                    onChange={(evt) => {
                        FluidFox.ToggleLog(token, (evt.target as HTMLInputElement).checked);
                    }}
                    type="checkbox"
                />
            </div>
        );
    }
}
