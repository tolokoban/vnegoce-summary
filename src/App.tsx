import React from "react"
import { IDashboard, IDashboardsByProxy, IRecordSet, IBackRow } from "./types"
import Dialog from "./tfw/factory/dialog"
import Button from "./tfw/view/button"
import Core from "./core"
import Row from "./Row"
import { register } from "./core"

import { convertDashboardsArrayToDaschboardsDict, toBackRows, toFrontRows, rowsSorter } from "./tools"

import "./App.css"

const BACK_FIELDS = JSON.stringify([
    "tb.description", "srv.cdEntite", "tb.nomCourt", "tb.cle", "tb.instance",
    "tb.nbOMAtt", "tb.nbNMACnf_BE_B", "tb.nbNMACnf_LI_B", "tb.nbRgrpAAttr",
    "tb.nbRgrpAFact", "tb.nbOGACnf", "tb.nbOGAFact", "tb.nbExeAtt",
    "srv.nbErreurs", "srv.nbEAATraiter"
]);
const FRONT_FIELDS = JSON.stringify([
    "tb.description", "srv.cdEntite", "tb.nomCourt", "tb.cle", "tb.instance",
    "tb.nbObjetNonTraite", "tb.nbRgrpEnc", "tb.nbOMRed", "tb.nbOMAtt",
    "tb.nbNMACnf_BE_F", "tb.nbNMACnf_LI_F", "tb.nbVirAValider",
    "tb.nbOGACnf", "srv.nbErreurs", "srv.nbEAATraiter"
]);

interface IAppProps {}

interface IAppState {
    message: string;
    wait: boolean;
    backRows: IBackRow[];
    frontRows: IBackRow[];
}

export default class App extends React.Component<IAppProps, IAppState> {
    constructor(props: IAppProps) {
        super(props);
        this.state = { message: "VNegoce", wait: false, backRows: [], frontRows: [] };
        this.handleClickFront = this.handleClickFront.bind(this);
        this.handleClickBack = this.handleClickBack.bind(this);
    }

    handleClickFront(entity: string, board: string) {
        Core.MoveTo(entity, board, "F");
    }

    handleClickBack(entity: string, board: string) {
        Core.MoveTo(entity, board, "B");
    }

    async componentDidMount() {
        try {
            const dashboards = await Core.GetDashboardsAccess("LOC");
            const dashboardsByProxy = convertDashboardsArrayToDaschboardsDict(dashboards);
            console.info("dashboardsByProxy=", dashboardsByProxy);
            this.createDatasets(dashboardsByProxy);
        } catch(ex) {
            Dialog.alert(`ERROR!\n\n${ex}`);
        }
    }

    private createDatasets( dashboardsByProxy: IDashboardsByProxy ) {
        for( const proxy of Object.keys(dashboardsByProxy) ) {
            const dashboards = dashboardsByProxy[proxy];
            this.createDatasetBack(proxy, dashboards);
            this.createDatasetFront(proxy, dashboards);
        }
    }

    private createDatasetFront( proxy: string, dashboards: IDashboard[] ) {
        if( !Array.isArray(dashboards) || dashboards.length === 0 ) return;
        const first = dashboards[0];
        const name = `FRONT:${proxy}`;
        Core.TraceInfo(`register to ${name}!`);
        register( `DS-${name}`, this.onDatasetFrontChange.bind(this), () => {} );
        Core.CreateDataset(
            name,
            first.entity,
            first.key,
            "TableauDeBord",
            FRONT_FIELDS,
            `tb.cle='${first.key}'`,
            5
        );
    }

    private createDatasetBack( proxy: string, dashboards: IDashboard[] ) {
        if( !Array.isArray(dashboards) || dashboards.length === 0 ) return;
        const first = dashboards[0];
        const name = `BACK:${proxy}`;
        Core.TraceInfo(`register to ${name}!`);
        register( `DS-${name}`, this.onDatasetBackChange.bind(this), () => {} );
        Core.CreateDataset(
            name,
            first.entity,
            first.key,
            "TableauDeBord",
            BACK_FIELDS,
            `tb.cle='${first.key}'`,
            5
        );
    }

    private onDatasetFrontChange(rs: IRecordSet) {
        const newRows: IBackRow[] = toFrontRows(rs);
        console.info("newRows=", newRows);
        const keys = newRows.map( row => `${row.proxy}/${row.key}` );
        const oldRows = this.state.frontRows.filter(
            row => keys.indexOf(`${row.proxy}/${row.key}`) === -1
        );
        this.setState({
            frontRows: oldRows.concat(newRows).sort(rowsSorter)
        })
    }

    private onDatasetBackChange(rs: IRecordSet) {
        const newRows: IBackRow[] = toBackRows(rs);
        const keys = newRows.map( row => `${row.proxy}/${row.key}` );
        const oldRows = this.state.backRows.filter(
            row => keys.indexOf(`${row.proxy}/${row.key}`) === -1
        );
        this.setState({
            backRows: oldRows.concat(newRows).sort(rowsSorter)
        })
    }

    render() {
        return (<div className="App">
            {this.state.frontRows.length > 0 ?
                (<h1>Front</h1>) :
                (<Button label="Loading Front Dashboards..." icon="wait" wait={true} flat={true}/>)}
            {this.state.frontRows.map(row => (
                <Row
                    onClick={this.handleClickFront}
                    key={`${row.proxy}#${row.id}`}
                    id={row.id}
                    name={row.name}
                    desc={row.desc}
                    proxy={row.proxy}
                    columns={row.columns}/>
            ))}
            {this.state.backRows.length > 0 ?
                (<h1>Back</h1>) :
                (<Button label="Loading Back Dashboards..." icon="wait" wait={true} flat={true}/>)}
            {this.state.backRows.map(row => (
                <Row
                    onClick={this.handleClickBack}
                    key={`${row.proxy}#${row.id}`}
                    id={row.id}
                    name={row.name}
                    desc={row.desc}
                    proxy={row.proxy}
                    columns={row.columns}/>
            ))}
        </div>)
    }
}
