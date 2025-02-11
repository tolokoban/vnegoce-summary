import * as React from "react"
import castStringArray from "../converter/string-array"
import castBoolean from "../converter/boolean"
import TouchableBehavior from "../behavior/touchable"
import "./touchable.css"

interface ITouchableProps {
    enabled?: boolean;
    onClick?: ()=>void;
    classes?: string[] | string;
    color?: string;
    children?: React.ReactElement<any>|React.ReactElement<any>[];
}

export default class Touchable extends React.Component<ITouchableProps, {}> {
    readonly touchable: TouchableBehavior;
    private ref = React.createRef();

    constructor(props: ITouchableProps) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
        this.touchable = new TouchableBehavior({onTap: this.handleClick, color: props.color});
    }

    componentDidMount() {
        const element = this.ref.current;
        if (!element) return;
        this.touchable.element = element;
    }

    handleClick() {
        const handler = this.props.onClick;
        if( typeof handler === 'function') {
            handler();
        }
    }

    render() {
        const p = this.props;
        const enabled = castBoolean(p.enabled, true);
        const classes = ["tfw-view-touchable"].concat(castStringArray(p.classes));
        if( enabled ) classes.push("enabled");
        return <div ref={this.ref} tabIndex={0} className={classes.join(" ")}>{
            p.children
        }</div>
    }
}
