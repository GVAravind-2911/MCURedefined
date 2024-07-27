import React, { useState, useEffect} from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import LoadingOverlay from "./LoadingOverlay";

function ProjectInfo(){
    const [project, setProject] = useState([]);
    const location = window.location.href;
    const [isLoading,setIsLoading] = useState(true);

    useEffect(() => {
        if(location.includes('release-slate')){
            var projectId = location.split('/').pop();
        }
        axios.get('/send-individual-project-data/'+projectId)
            .then(response => {setProject(response.data);
            console.log(response.data);
            setIsLoading(false);})
            .catch(error => console.error(error));
    }
    , []);

    return(
        <>
        {isLoading &&
            <LoadingOverlay/>
        }
        {!isLoading && <>
        <div className="poster">
            <img src = {project.posterpath} alt="Poster" className="projectinfo-imgposter"/>
        </div>
            <div className="projectinfo-content">
                <h1>{project.name}</h1>
                <br/>
                <h3>Release Date : {project.release_date}</h3>
                <br/>
                <h3>Director : {project.director}</h3>
                <br/>
                <h3>Music By : {project.musicartist}</h3>
                <br/>
                <h3>Cast :</h3><p>{project.castinfo}</p>
                <br/>
                <h3>Synopsis : </h3>
                <p>{project.synopsis}</p>
            </div>
            </>
        }
        </>
    );
}

const domContainer = document.querySelector('#projectinfo-main');
const root = ReactDOM.createRoot(domContainer);
root.render(<ProjectInfo />);