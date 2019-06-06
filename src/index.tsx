import React from "react";
import ReactDOM from 'react-dom'
import { Provider } from 'react-redux'
import Theme from "./tfw/theme"
import App from "./App"

import "./tfw/font/josefin.css"
import "./index.css"

Theme.apply("default");

ReactDOM.render(
    <App/>,
    document.getElementById("root"));
