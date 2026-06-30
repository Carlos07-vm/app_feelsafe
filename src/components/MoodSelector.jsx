import {useApp} from "../context/AppContext";

function MoodSelector(){

const {user,setUser}=useApp();

const moods=[

"😊",
"😄",
"😐",
"😔",
"😭",
"😡",
"😰"

];

const selectMood=(emoji)=>{

const names={

"😊":"Feliz",

"😄":"Muy Feliz",

"😐":"Neutral",

"😔":"Triste",

"😭":"Muy Triste",

"😡":"Enojado",

"😰":"Ansioso"

};

setUser({

...user,

currentMood:names[emoji]

});

};

return(

<div className="mood-selector">

{

moods.map((m)=>(

<button

key={m}

onClick={()=>selectMood(m)}

>

{m}

</button>

))

}

</div>

);

}

export default MoodSelector;