import Dialog from "../tfw/factory/dialog"
import MOCKS from "./mocks"

/* exported window.NegoceCore */
const Api: { [key: string]: () => void } = {
    Alert: mock(
        "Alert",
        (id: string, message: string, title: string) => window.NegoceCore.Alert(id, message, title)
    ),
    CreateDataset: mock(
        "CreateDataset",
        (
            id: string, name: string, entity: string, board: string, objectName: string,
            fields: string, query: string, refrehPeriod: number
        ) => window.NegoceCore.CreateDataset(
            id, name, entity, board, objectName, fields, query, refrehPeriod)
    ),
    GetDashboardsAccess: mock(
        "GetDashboardsAccess",
        (id: string, entity: string) => window.NegoceCore.GetDashboardsAccess(id, entity)
    ),
    MoveTo: mock(
        "MoveTo",
        (id: string, entity: string, board: string, role: string) => window.NegoceCore.MoveTo(id, entity, board, role)
    ),
    TraceInfo: mock(
        "TraceInfo",
        (id: string, message: string) => window.NegoceCore.TraceInfo(id, message)
    )
};

export default Api;


function mock(name: string, lambda: (...args: any) => any): () => void {
    if (window.NegoceCore && window.NegoceCore[name])
        return (...params) => {
            try {
                lambda(...params);
            } catch (ex) {
                Dialog.alert(ex);
            }
        };
    console.warn(`Core.${name} is a mock!`);
    //Dialog.alert(`Core.${name} is a mock!`);
    return MOCKS[name];
}

console.info("window.NegoceCore=", window.NegoceCore);
console.info("Api=", Api);
