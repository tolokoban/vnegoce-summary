import React from "react"

import "./label.css"

interface ILabelProps {
    label: string;
}

export default class Label extends React.Component<ILabelProps, {}> {
    constructor( props: ILabelProps ) {
        super( props );
    }

    render() {
        return (<div className="thm-bgPD tfw-view-Label">{
            this.props.label
        }</div>)
    }
}
