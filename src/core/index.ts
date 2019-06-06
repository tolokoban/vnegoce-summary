/**
 * This application aims to be launched withing a DotNET application.
 * This application will povide a global object called `NegoceCore`.
 *
 * In order to manage asynchronous calls to the mobile, we provide a single
 * callback: `window.onNegoceCoreMessage( id, message )`.
 */
import { IDashboard, IRecordSet } from "../types"
import Api from "./api"

export default {
    Alert: wrap("Alert") as (message: string, title: string) => Promise<{}>,
    CreateDataset: wrap("CreateDataset") as (
        name: string, entity: string, board: string, objectName: string,
        fields: string, query: string, refrehPeriod: number) => Promise<IRecordSet>,
    GetDashboardsAccess: wrap("GetDashboardsAccess") as (entity: string) => Promise<IDashboard[]>,
    MoveTo: wrap("MoveTo") as (entity: string, board: string, role: string) => Promise<{}>,
    TraceInfo: wrap("TraceInfo") as (message: string) => Promise<{}>
}

type TCallback = ({ }) => void;

let ID: number = 0;
const CALLBACKS: { [key: string]: { onMessage: TCallback, onError: TCallback } } = {};

export function register(id: string, onMessage: TCallback, onError: TCallback) {
    CALLBACKS[id] = { onMessage, onError };
}

export function unregister(id: string) {
    delete CALLBACKS[id];
}

function wrap(funcName: string) {
    const api: (...args: any[]) => void = Api[funcName];

    return function(...args: any[]) {
        console.log(`>>> Core.${funcName}(`, ...args, ")");
        return new Promise((resolve, reject) => {
            const id = `_${ID++}_`;
            const unreg = () => unregister(id);
            const onMessage = (msg: any) => {
                console.log(`Message from ${funcName}:`, msg);
                unreg();
                resolve(msg);
            }
            const onError = (err: any) => {
                console.log(`Error from ${funcName}:`, err);
                unreg();
                reject(err);
            }
            register(id, onMessage, onError);
            try {
                api(id, ...args);
            } catch (ex) {
                console.error(`Exception in ${funcName}:`, ex);
                onError(ex);
            }
        });
    };
}

window.onNegoceCoreMessage = function(id: string, msg: any) {
    const { onMessage } = CALLBACKS[id];
    if (typeof onMessage !== 'function') {
        throw Error(`There is no valid message callback with id="${id}"!`);
    }
    window.setTimeout(() => {
        try {
            onMessage(msg);
        }
        catch(ex) {
            console.error("Error in Javascript processing of message: ", msg);
            console.error(ex);
        }
    });
}

window.onNegoceCoreError = function(id: string, err: any) {
    const { onError } = CALLBACKS[id];
    if (typeof onError !== 'function') {
        throw Error(`There is no valid error callback with id="${id}"!`);
    }
    window.setTimeout(() => onError(err));
}
