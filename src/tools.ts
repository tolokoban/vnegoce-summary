import { IDashboard, IRecordSet, IDashboardsByProxy, IBackRow } from "./types"

export function convertDashboardsArrayToDaschboardsDict(dashboards: IDashboard[]): IDashboardsByProxy {
    const output: IDashboardsByProxy = {};
    dashboards.forEach((dashboard: IDashboard) => {
        const proxy = dashboard.proxy;
        if( !Array.isArray(output[proxy]) ) output[proxy] = [];
        output[proxy].push(dashboard);
    });
    return output;
}


export function toBackRows(rs: IRecordSet): IBackRow[] {
    const itr = new RecordSetIterator(rs);
    const output = [];
    for( let row=0; row<itr.count; row++ ) {
        output.push({
            proxy: itr.read(row, "tb.instance"),
            id: itr.read(row, "tb.cle"),
            name: itr.read(row, "tb.nomCourt"),
            desc: itr.read(row, "tb.description"),
            columns: [
                itr.read(row, "tb.nbOMAtt"),
                itr.read(row, "tb.nbNMACnf_BE_B"),
                itr.read(row, "tb.nbNMACnf_LI_B"),
                itr.read(row, "tb.nbRgrpAAttr"),
                itr.read(row, "tb.nbRgrpAFact"),
                itr.read(row, "tb.nbOGACnf"),
                itr.read(row, "tb.nbOGAFact"),
                itr.read(row, "tb.nbExeAtt"),
                itr.read(row, "srv.nbErreurs"),
                itr.read(row, "srv.nbEAATraiter"),
            ]
        })
    }
    return output.sort(rowsSorter);
}

export function toFrontRows(rs: IRecordSet): IBackRow[] {
    const itr = new RecordSetIterator(rs);
    const output = [];
    for( let row=0; row<itr.count; row++ ) {
        output.push({
            proxy: itr.read(row, "tb.instance"),
            id: itr.read(row, "tb.cle"),
            name: itr.read(row, "tb.nomCourt"),
            desc: itr.read(row, "tb.description"),
            columns: [
                itr.read(row, "tb.nbObjetNonTraite"),
                itr.read(row, "tb.nbRgrpEnc"),
                itr.read(row, "tb.nbOMRed"),
                itr.read(row, "tb.nbOMAtt"),
                itr.read(row, "tb.nbNMACnf_BE_F"),
                itr.read(row, "tb.nbNMACnf_LI_F"),
                itr.read(row, "tb.nbVirAValider"),
                itr.read(row, "tb.nbOGACnf"),
                itr.read(row, "srv.nbErreurs"),
                itr.read(row, "srv.nbEAATraiter"),
            ]
        })
    }
    return output.sort(rowsSorter);
}

export function rowsSorter(a: IBackRow, b: IBackRow) {
    const A = `${a.proxy}/${a.name}`;
    const B = `${b.proxy}/${b.name}`;
    if( A < B ) return -1;
    if( A > B ) return +1;
    return 0;
}

export class RecordSetIterator {
    private readonly cols: number;
    private readonly rows: number;
    private readonly map: {[key: string]: number};
    private readonly data: string[];

    constructor(rs: IRecordSet) {
        console.info("rs=", rs);
        this.cols = rs.header.length;
        this.rows = rs.data.length / this.cols;
        this.data = rs.data;
        this.map = {};
        rs.header.forEach((header: string, index: number) => {
            this.map[header] = index;
        }, this);
    }

    get count() {
        return this.rows;
    }

    read(row: number, col: string): string {
        const shift = this.map[col];
        if( typeof shift === 'undefined' ) return "";
        const index = row * this.cols + shift;
        const value = this.data[index];

        return value.trim() === "0" ? "" : value;
    }
}
