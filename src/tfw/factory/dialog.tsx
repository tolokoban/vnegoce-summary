export default {
    /**
     * @param {string|React.ReactElement<any>} message
     * @param {()=>void|null} onClose
     */
    alert,
    /**
     * @param {string} caption - Title and button caption.
     * @param {any} content - Content to display.
     * @return Promise<boolean> Confirmed or not?
     */
    confirm,
    show,
    wait
};

import * as React from "react"
import ReactDOM from 'react-dom'
import Icon from "../view/icon"
import Flex from "../layout/flex"
import EscapeHandler from "../escape-handler"
import castString from "../converter/string"
import castBoolean from "../converter/boolean"
import "./dialog.css"

import Button from "../view/button"

import Intl from "../intl";
const _ = Intl.make(require("./dialog.yaml"));

interface IOptions {
    onClose?: () => void;
    closeOnEscape?: boolean;
    icon?: string;
    title?: string;
    content?: string | React.ReactElement<any>;
    footer?: React.ReactElement<any>[] | React.ReactElement<any> | null;
    maxWidth?: number;
}

class Dialog {
    _screen: HTMLElement;
    _options: IOptions;
    footer: React.ReactElement<any>[] | React.ReactElement<any> | null = null;

    constructor(options: IOptions = {}) {
        this._options = Object.assign({
            closeOnEscape: true,
            footer: <Button
                icon="close"
                label = { _('close') }
                flat={ true}
                onClick={() => this.hide()}/>
        }, options);
        this._options.closeOnEscape = castBoolean(this._options.closeOnEscape, true);
        this.footer = this._options.footer;
        const screen = document.createElement("div");
        screen.className = "tfw-factory-dialog";
        document.body.appendChild(screen);
        this._screen = screen;
        this.hide = this.hide.bind(this);
        if (this._options.closeOnEscape) {
            EscapeHandler.add(() => this._hide());
        }
    }

    set onClose(slot: () => void) {
        this._options.onClose = slot;
    }

    show() {
        const opt = this._options;
        const title = castString(opt.title, "").trim();
        const icon = castString(opt.icon, "").trim();
        let footer: React.ReactElement<any> | null =
            this.footer ? (<footer className= "thm-bg2 thm-ele-button">{
                this.footer
            }</footer>) : null;
            let header = null;
        if (title.length > 0) {
            header = (
                <header className= "thm-bgPD">
                    { icon.length > 0 ? <Icon content={ icon } /> : null}
                    <div>{title}</div>
                </header>
            )
        }

        ReactDOM.render((
            <div
                className="thm-ele-dialog thm-bg1"
                style={{
                    maxWidth: typeof opt.maxWidth === 'number' ? `${opt.maxWidth}px` : "auto"
                }}>
                {header}
                <div>{opt.content}</div>
                {footer}
            </div>
        ), this._screen);
        setTimeout(() => this._screen.classList.add("show"), 10);
    }

    hide() {
        if (!this._options.closeOnEscape) {
            this._hide();
        } else {
            EscapeHandler.fire();
        }
    }

    _hide() {
        const screen = this._screen;
        screen.classList.remove("show");
        setTimeout(() => {
            document.body.removeChild(screen);
        }, 200);
        const onClose = this._options.onClose;
        if (typeof onClose === 'function') {
            requestAnimationFrame(onClose);
        }
    }
}

function alert(content: string | React.ReactElement<any>, onClose: () => void | null = null): Dialog {
    const dialog = new Dialog({ onClose, content, maxWidth: 420 });
    dialog.footer = (<Button
        icon="close"
        label={_('close')}
        flat={true}
        onClick={dialog.hide} />);
    dialog.show();
    return dialog;
}

/**
 * @param {string} caption - Title and button caption.
 * @param {any} content - Content to display.
 * @return Promise<boolean> Confirmed or not?
 */
function confirm( caption: string, content: string | React.ReactElement<any>): Promise<boolean> {
    return new Promise( resolve => {
        const dialog = new Dialog({ title: caption, content, maxWidth: 420 });
        const close = (confirmed: boolean) => {
            dialog.hide();
            resolve( confirmed );
        };
        dialog.onClose = () => close(false);
        const btnCancel = (<Button
            key="cancel"
            flat={true}
            label={_("cancel")}
            onClick={() => close(false)}/>);
        const btnOK = (<Button
            key="ok"
            warning={true}
            label={caption}
            onClick={() => close(true)}/>);
        dialog.footer = [ btnCancel, btnOK ];
        dialog.show();
    });
}

function show(options: IOptions): Dialog {
    const dialog = new Dialog(options);
    dialog.show();
    return dialog;
}

function wait(label: string, task: Promise<any>): Promise<any> {
    const content = (
        <Flex dir="row" justifyContent="flex-start" alignItems="center" >
            <Icon content="wait" animate={true}/>
            <div>{label}</div>
        </Flex>
    );
    const dialog = new Dialog({ content, footer: null, closeOnEscape: false });
    dialog.show();
    const close = dialog.hide.bind( dialog );
    return new Promise( (resolve, reject) => {
        task.then(
            (result: any) => {
                close();
                resolve( result );
            },
            (error: any) => {
                console.error( error );
                close();
                reject( error );
            }
        );
    });
}
