import Dialog from "../tfw/factory/dialog"
import DashboardsData from "./data/dashboards.json"

function msg(id: string, arg: any = null) {
    window.onNegoceCoreMessage(id, arg);
}

const MOCKS: { [key: string]: (id: string, ...arg: any) => void } = {
    async Alert(id: string, message: string, title: string) {
        const modal = Dialog.show({
            onClose: () => msg(id),
            icon: "show",
            title: title,
            content: message
        });
    },

    CreateDataset(id: string, name: string, entity: string, board: string, objectName: string,
            fields: string, query: string, refreshPeriod: number) {
        window.setInterval(() => {
            if( Math.random() < .8 ) return;
            msg(`DS-${name}`, {
                "header": [
                    "tb.description", "srv.cdEntite", "tb.nomCourt", "tb.cle", "tb.instance", "tb.nbOMAtt", "tb.nbNMACnf_BE_B", "tb.nbNMACnf_LI_B", "tb.nbRgrpAAttr", "tb.nbRgrpAFact", "tb.nbOGACnf", "tb.nbOGAFact", "tb.nbExeAtt", "srv.nbErreurs", "srv.nbEAATraiter"
                ],
                "data": [
                    `BackOffice ${entity}`, entity, "", board, `Negoce_Bourse_${entity}`,
                    rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd(), rnd()
                ] })
        }, 3000 + 3 * Math.random());
    },

    GetDashboardsAccess(id: string, entity: string) {
        window.setTimeout(() => msg(id, DashboardsData), 2000);
    },

    MoveTo(id: string, entity: string, board: string, role: string) {
        Dialog.alert(`Move to entity ${entity} and board ${board} (role ${role})!`, () => msg(id, undefined));
    },

    TraceInfo(id: string, message: string) {
        console.info( "[Core.TraceInfo]", message );
        msg(id, message);
    }
}

function rnd() {
    if( Math.random() < .9 ) return "0";
    return `${Math.floor(1000 * Math.random())}`;
}

export default MOCKS;
