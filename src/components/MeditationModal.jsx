import { useState, useEffect } from "react";
import "../styles/MeditationModal.css";

function MeditationModal({close}) {
    const [seconds, setSeconds] = useState(60);
    const [running,setRunning] = useState(false);


useEffect(()=>{

    if(!running) return;

     const timer = setInterval(()=>{

        setSeconds(prev=>{
             if(prev <= 1){
            clearInterval(timer);
            return 0;
         }

            return prev - 1;
        
        });

     },1000);

     return ()=>clearInterval(timer);
    },[running]);

    return (
         <div className="modal-background">
             <div className="meditation-box">
                <h2>Meditación Guiada</h2>
                <p>Relaja tu mente y mejora tu concentración,
                    respira lentamnte  y enfocate en el momneto presente 
                </p>

                <h1>Tiempo restante: {seconds} segundos</h1>

                {
                    seconds === 0?
                    <h3> secion completada  </h3>
                    :
                    null
                }

               < button onClick={()=>setRunning(true)}>
               Iniciar 
               </button>

               < button onClick={close}>
               Cerrar 
               </button>


             </div>
         </div>

    )
}

export default MeditationModal;


