import React from "react";
import { trefoil } from "ldrs";

trefoil.register();

function LoadingOverlay(){
    return(
        <>
        <div className="loadingOverlay">
          <div className="loading">
            <l-trefoil
              size="50"
              stroke="5"
              stroke-length="0.15"
              bg-opacity="0.1"
              speed="1.4" 
              color="#FFF" >
            </l-trefoil>
          </div>
        </div>
    </>
    );
}

export default LoadingOverlay;