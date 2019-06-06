import React from "react"
import Touchable from "./tfw/view/touchable"
import "./Cell.css"

interface ICellProps {
    value: string,
    onClick?: () => void
}

export default class Cell extends React.Component<ICellProps, {}> {
    private readonly ref: React.RefObject<HTMLDivElement> = React.createRef();

    constructor( props: ICellProps ) {
        super( props );
        this.handleClick = this.handleClick.bind( this );
    }

    handleClick() {
        const handler = this.props.onClick;
        if (typeof handler !== 'function') return;
        try {
            handler();
        } catch(ex) {
            console.error("Error in handleClick(): ", );
            console.error(ex);
        }
    }

    componentDidUpdate(prevProps: ICellProps) {
        if( prevProps.value !== this.props.value) {
            const div = this.ref.current;
            if( !div ) return;
            div.classList.remove("stop");
            div.classList.add("start");
            window.setTimeout(() => {
                div.classList.add("stop");
                div.classList.remove("start");
            });
        }
    }

    render() {
        return (<div ref={this.ref} className="Cell">
        <Touchable color="#fff" onClick={this.handleClick}><div>{
            this.props.value
        }</div></Touchable></div>)
    }
}
