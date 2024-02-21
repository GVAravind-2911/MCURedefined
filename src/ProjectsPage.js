import React from "react";
import ReactDOM from "react-dom/client";
import axios from "axios";
import { trefoil } from 'ldrs'

trefoil.register()

function OrderComponent() {
    const [phase1, setPhase1] = React.useState([]);
    const [phase2, setPhase2] = React.useState([]);
    const [phase3, setPhase3] = React.useState([]);
    const [contentdict, setContentDict] = React.useState([]);
    const [sort, setSort] = React.useState([]);
    const [isLoading, setIsLoading] = React.useState(false);

    React.useEffect(() => {
        setIsLoading(true);
        axios.get("/send-data").then(response => {
            setSort(response.data[3].sortID);
            setPhase1(response.data[0]);
            setPhase2(response.data[1]);
            setPhase3(response.data[2]);
            setContentDict(response.data);
            console.log(response.data[3]);
            setContentDict((response.data[0].concat(response.data[1],response.data[2])).sort((a,b) => (a.timelineid > b.timelineid) ? 1 : -1));
            console.log(response.data[3].sortID);
            console.log(response.data);
            setIsLoading(false);
        });
    }, []);


    const Timelinesort = () => {
        setSort(0);
        axios.post('/receive-data', {sortID: 0});
        axios.get('/send-data').then(response =>{
            console.log('Fetch Timeline Successful',response.data);
        });
        console.log(sort,contentdict);
    };
    const Releasesort = () => {
        setSort(1);
        axios.post('/receive-data', {sortID: 1});
        axios.get('/send-data').then(response =>{
            console.log('Fetch Timeline Successful',response.data);
        });
        console.log(phase1,phase2,phase3);
        console.log(sort);
    };

    if (sort=== 1) {
        console.log('Check At 1');
    return (
        <>
            {/* Render phase1, phase2, and phase3 data as needed */}
            {isLoading && <div className="loadingRelease">
                <l-trefoil
                    size="50"
                    stroke="5"
                    stroke-length="0.15"
                    bg-opacity="0.1"
                    speed="1.4" 
                    color="#FFF" >
                </l-trefoil>
            </div>}
            {!isLoading &&
            <div className="contentFill">
            <div className="sort">
                <div className="sort-release">
                    <button id="releasesort-active">
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 20 20">
                        <path fill="white" d="M6 1a1 1 0 0 0-2 0h2ZM4 4a1 1 0 0 0 2 0H4Zm7-3a1 1 0 1 0-2 0h2ZM9 4a1 1 0 1 0 2 0H9Zm7-3a1 1 0 1 0-2 0h2Zm-2 3a1 1 0 1 0 2 0h-2ZM1 6a1 1 0 0 0 0 2V6Zm18 2a1 1 0 1 0 0-2v2ZM5 11v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 11v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 15v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 15v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 11v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM5 15v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM2 4h16V2H2v2Zm16 0h2a2 2 0 0 0-2-2v2Zm0 0v14h2V4h-2Zm0 14v2a2 2 0 0 0 2-2h-2Zm0 0H2v2h16v-2ZM2 18H0a2 2 0 0 0 2 2v-2Zm0 0V4H0v14h2ZM2 4V2a2 2 0 0 0-2 2h2Zm2-3v3h2V1H4Zm5 0v3h2V1H9Zm5 0v3h2V1h-2ZM1 8h18V6H1v2Zm3 3v.01h2V11H4Zm1 1.01h.01v-2H5v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H5v2h.01v-2ZM9 11v.01h2V11H9Zm1 1.01h.01v-2H10v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM9 15v.01h2V15H9Zm1 1.01h.01v-2H10v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM14 15v.01h2V15h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM14 11v.01h2V11h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM4 15v.01h2V15H4Zm1 1.01h.01v-2H5v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H5v2h.01v-2Z"/>
                    </svg>
                    </button>
            </div>
            <div className="sort-timeline">
                    <button id="timelinesort"  onClick={Timelinesort}>
                    <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 20 20">
                        <path stroke="white" strokeLinejoin="round" strokeWidth="2" d="M10 6v4l3.276 3.276M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                    </svg>
                    </button>
                </div>
            </div> 
            <div className="mainphase-name">
                <h1>Phase 1</h1>
            </div>
            <div className="phase1">
            {phase1.map(project => (
                <a href={`/release-slate/${project.id}`} className="anchorlink"  key={project.id}>
                <div className="phase1-projectcard">
                    <div className = 'img-container'>
                    <img src={project.posterpath} alt="Phase 1 Project Poster" className="phase1-posters"/>
                    </div>
                    <div className="phase1-name">
                        <h1>{project.name}</h1>
                    </div>
                </div>
                </a>
            ))}
            </div>
            <div className="mainphase-name">
                <h1>Phase 2</h1>
            </div>
            <div className="phase2">
            {phase2.map(project => (
                <a href={`/release-slate/${project.id}`} className="anchorlink"  key={project.id}>
                <div className="phase2-projectcard">
                    <div className = 'img-container'>
                    <img src={project.posterpath} alt="Phase 2 Project Poster" className="phase2-posters"/>
                    </div>
                    <div className="phase2-name">
                        <h1>{project.name}</h1>
                    </div>
                </div>
                </a>
            ))}
            </div>
            <div className="mainphase-name">
                <h1>Phase 3</h1>
            </div>
            <div className="phase3">
            {phase3.map(project => (
                <a href={`/release-slate/${project.id}`} className="anchorlink"  key={project.id}>
                <div className="phase3-projectcard">
                    <div className = 'img-container'>
                        <img src={project.posterpath} alt="Phase 3 Project Poster" className="phase3-posters" />
                        </div>
                        <div className="phase3-name">
                            <h1>{project.name}</h1>
                        </div>
                </div>
                </a>
            ))}
            </div>
        </div>
    }
        </>
    );
    }
    else{
        return (
            <>
            {isLoading && <div className="loading">
                <l-trefoil
                    size="50"
                    stroke="5"
                    stroke-length="0.15"
                    bg-opacity="0.1"
                    speed="1.4" 
                    color="#FFF" >
                </l-trefoil>
            </div>}
            {!isLoading && 
                <div>
                <div className="sort">
                    <div className="sort-release">
                        <button id="releasesort" onClick={Releasesort}>
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 20 20">
                            <path fill="white" d="M6 1a1 1 0 0 0-2 0h2ZM4 4a1 1 0 0 0 2 0H4Zm7-3a1 1 0 1 0-2 0h2ZM9 4a1 1 0 1 0 2 0H9Zm7-3a1 1 0 1 0-2 0h2Zm-2 3a1 1 0 1 0 2 0h-2ZM1 6a1 1 0 0 0 0 2V6Zm18 2a1 1 0 1 0 0-2v2ZM5 11v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 11v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM10 15v-1H9v1h1Zm0 .01H9v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 15v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM15 11v-1h-1v1h1Zm0 .01h-1v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM5 15v-1H4v1h1Zm0 .01H4v1h1v-1Zm.01 0v1h1v-1h-1Zm0-.01h1v-1h-1v1ZM2 4h16V2H2v2Zm16 0h2a2 2 0 0 0-2-2v2Zm0 0v14h2V4h-2Zm0 14v2a2 2 0 0 0 2-2h-2Zm0 0H2v2h16v-2ZM2 18H0a2 2 0 0 0 2 2v-2Zm0 0V4H0v14h2ZM2 4V2a2 2 0 0 0-2 2h2Zm2-3v3h2V1H4Zm5 0v3h2V1H9Zm5 0v3h2V1h-2ZM1 8h18V6H1v2Zm3 3v.01h2V11H4Zm1 1.01h.01v-2H5v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H5v2h.01v-2ZM9 11v.01h2V11H9Zm1 1.01h.01v-2H10v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM9 15v.01h2V15H9Zm1 1.01h.01v-2H10v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H10v2h.01v-2ZM14 15v.01h2V15h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM14 11v.01h2V11h-2Zm1 1.01h.01v-2H15v2Zm1.01-1V11h-2v.01h2Zm-1-1.01H15v2h.01v-2ZM4 15v.01h2V15H4Zm1 1.01h.01v-2H5v2Zm1.01-1V15h-2v.01h2Zm-1-1.01H5v2h.01v-2Z"/>
                        </svg>
                        </button>
                    </div>
                    <div className="sort-timeline">
                        <button id="timelinesort-active">
                        <svg className="w-6 h-6 text-gray-800 dark:text-white" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" width="30" height="30" fill="none" viewBox="0 0 20 20">
                            <path stroke="white" strokeLinejoin="round" strokeWidth="2" d="M10 6v4l3.276 3.276M19 10a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"/>
                        </svg>
                        </button>
                    </div>
                </div>
                <div className="mainphase-name">
                    <h1>Timeline Order</h1>
                </div>
                <div className="phase1">
                {contentdict.map(project => (
                    <a href={`/release-slate/${project.id}`} className="anchorlink"  key={project.id}>
                    <div className="phase1-projectcard">
                        <div className = 'img-container'>
                        <img src={project.posterpath} alt="Phase 1 Project Poster" className="phase1-posters"/>
                        </div>
                        <div className="phase1-name">
                            <h1>{project.name}</h1>
                        </div>
                    </div>
                    </a>
                ))}
                </div>
                </div>
    }
            </>
        );
    }

}

const domContainer = document.querySelector('#datafromjson');
const root = ReactDOM.createRoot(domContainer);
root.render(<OrderComponent />);