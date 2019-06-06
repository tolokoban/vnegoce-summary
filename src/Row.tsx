import React from "react"
import { IBackRow } from "./types"
import Cell from "./Cell"

import "./Row.css"

interface IRowProps extends IBackRow {
    onClick?: (entity: string, board: string) => void
}

export default class Row extends React.Component<IRowProps, {}> {
    constructor( props: IRowProps ) {
        super( props );
        this.handleClick = this.handleClick.bind( this );
    }

    handleClick() {
        const handler = this.props.onClick;
        if (typeof handler !== 'function') return;
        try {
            const entity = this.props.proxy.substr(this.props.proxy.length - 3);
            const board = this.props.id;
            console.info("entity, board=", entity, board);
            handler(entity, board);
        } catch(ex) {
            console.error("Error in handleClick(): ", );
            console.error(ex);
        }
    }

    render() {
        const entity = extractEntity(this.props.proxy);

        return (<div className="Row">
            <div className="name" title={this.props.desc}>{`${entity} ${this.props.name}`}</div>
            {
                this.props.columns.map( (col, idx) => (
                    <Cell key={idx} value={col} onClick={this.handleClick}/>
                ))
            }
        </div>)
    }
}


function extractEntity(instance: string) {
    return instance.substr( instance.length - 3 );
}
