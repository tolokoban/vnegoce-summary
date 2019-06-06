export interface IRecordSet {
    header: string[],
    data: string[]
}

export interface IDashboard {
    id: string,
    entity: string,
    name: string,
    back: string,
    proxy: string,
    desc: string
}

export interface IDashboardsByProxy {
    [key: string]: IDashboard[]
}

export interface IBackRow {
    proxy: string,
    id: string,
    name: string,
    desc: string,
    columns: string[]
}
