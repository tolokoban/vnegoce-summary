import React from "react"
import castArray from "../converter/array"
import castBoolean from "../converter/boolean"
import castStringArray from "../converter/string-array"
import "./stack.css"

interface IStackProps {
    value: string;
    classes?: string | string[];
    scrollable?: boolean;
    children: React.ReactElement<any>[];
}

export default class Stack extends React.Component<IStackProps, {}> {
    render() {
        const children = castArray(this.props.children);
        const scrollable = castBoolean(this.props.scrollable, false);
        const classes = ["tfw-layout-stack"];
        classes.push(...castStringArray(this.props.classes));
        if (scrollable) classes.push("scrollable");
        return (
            <div className={classes.join(" ")}>{
                children.filter(elem => elem.key == this.props.value)
            }</div>
        );
    }
}
