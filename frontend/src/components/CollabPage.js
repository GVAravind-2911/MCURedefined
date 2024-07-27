import React from "react";
import  ReactDOM  from "react-dom/client";
import axios from "axios";

function MainComponent(){
    return(
        <div className="jsdiv">
            <h1 className="mainHead">Collab Page</h1>
        </div>
    )
}

const domContainer = document.querySelector('#maincontentdiv');
const root = ReactDOM.createRoot(domContainer);
root.render(<MainComponent/>)