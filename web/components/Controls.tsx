import { Component } from "inferno";
import { style } from "typestyle";
import SearchBox from "./SearchBox";
import ControlNode from "./ControlNode";

const classMain = style({
    backgroundColor: "#333",
    minWidth: "250px",
    maxWidth: "250px",
    height: "100%",
    display: "flex",
    flexDirection: "column",
    overflowY: "auto",
});

const classTitle = style({
    color: "#eee",
    textAlign: "center",
    paddingTop: 8,
    paddingBottom: 8,
    $nest: {
        h1: {
            fontSize: 20,
        },
    },
});

const classLogs = style({
    height: "100%",
    width: "100%",
});

interface IControlsState {
    checkmarks: Map<string, boolean[]>;
    harvesters: {
        [key: string]: string[]
    };
}

export default class Controls extends Component<any, IControlsState> {
    constructor() {
        super();
        this.state = {
            checkmarks: new Map(),
            harvesters: {
                proxy1: [
                    "/var/log/nginx/access.log",
                    "/var/log/nginx/error.log",
                    "/var/log/zabbix.log",
                ],
                pg1: [
                    "/var/log/postgres.log",
                    "/var/log/patroni.log",
                    "/var/log/zabbix.log",
                ],
                pg2: [
                    "/var/log/postgres.log",
                    "/var/log/patroni.log",
                    "/var/log/zabbix.log",
                ],
                pg3: [
                    "/var/log/postgres.log",
                    "/var/log/patroni.log",
                    "/var/log/zabbix.log",
                ],
                harvester: [
                    "S:\\git\\Log.io\\logs\\logs.txt",
                    "S:\\git\\Log.io\\logs\\tomate.txt",
                ],
            },
        };
    }
    public componentDidMount() {
        this.updateCheckboxs();
    }
    public render() {
        const colors = ["#1f77b4", "#aec7e8", "#ff7f0e", "#ffbb78", "#2ca02c", "#98df8a",
            "#d62728", "#ff9896", "#9467bd", "#c5b0d5", "#8c564b", "#c49c94", "#e377c2",
            "#f7b6d2", "#7f7f7f", "#c7c7c7", "#bcbd22", "#dbdb8d", "#17becf", "#9edae5",
        ];
        let count = 0;
        const nodes = [];
        for (const [harvesterName, harvester] of Object.entries(this.state.harvesters)) {
            nodes.push(<ControlNode
                onCheck={(checked: boolean) => {
                    this.changeCheckboxState(harvesterName, null, checked);
                }}
                checkState={() => {
                    if (this.state.checkmarks.size === 0) return false;
                    return this.state.checkmarks.get(harvesterName)[0];
                }}
                isParent={true}
                color={colors[++count < colors.length ? count : count = 0]
                }>
                {harvesterName}
            </ControlNode>);

            (harvester as string[]).forEach((file) => {
                const path = file.indexOf("/") !== -1 ? file.split("/") : file.split("\\");
                nodes.push(<ControlNode
                    onCheck={(checked: boolean) => {
                        this.changeCheckboxState(harvesterName, file, checked);
                    }}
                    checkState={() => {
                        if (this.state.checkmarks.size === 0) return false;
                        return this.state.checkmarks.get(`${harvesterName}|${file}`)[0];
                    }}
                    color={
                        colors[++count < colors.length ? count : count = 0]
                    }>
                    {path[path.length - 1]}
                </ControlNode>);
            });
        }
        return (
            <div class={classMain}>
                <div class={classTitle}><h1>Nodes</h1></div>
                <SearchBox />
                <div class={classLogs}>
                    {nodes}
                </div>
            </div>
        );
    }
    private changeCheckboxState(harvesterName: string, fileName: string | null, checked: boolean) {
        const newCheckmarks = this.state.checkmarks;
        newCheckmarks.set(fileName === null ? harvesterName : `${harvesterName}|${fileName}`, [checked]);
        if (fileName === null) {
            newCheckmarks.forEach((v, key) => {
                if (key.startsWith(harvesterName)) newCheckmarks.set(key, [checked]);
            });
        } else {
            const childs = [];
            newCheckmarks.forEach((v, key) => {
                if (key.startsWith(harvesterName) && !(key === harvesterName)) {
                    childs.push(v[0]);
                }
            });
            newCheckmarks.set(harvesterName, [childs.every((v) => v)]);
        }
        this.setState({
            checkmarks: newCheckmarks
        });
    }
    private updateCheckboxs() {
        const newCheckmarks: IControlsState["checkmarks"] = new Map();
        Object.entries(this.state.harvesters).forEach((harvester) => {
            const harvesterName = harvester[0] as string;
            newCheckmarks.set(harvesterName, new Array(1).fill(true));
            (harvester[1] as string[]).forEach((file) => {
                newCheckmarks.set(`${harvesterName}|${file}`, new Array(1).fill(true));
            });
        });

        this.setState({
            checkmarks: newCheckmarks
        });
    }
}
