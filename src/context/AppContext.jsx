import { createContext, useContext, useState } from "react";

import mockUser from "../data/mockUser";

const AppContext=createContext();

export function AppProvider({children}){

const[user,setUser]=useState(mockUser);

return(

<AppContext.Provider
value={{
user,
setUser
}}
>

{children}

</AppContext.Provider>

);

}

export const useApp=()=>useContext(AppContext);