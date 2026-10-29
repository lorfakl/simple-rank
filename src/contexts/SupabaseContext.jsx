import React, { createContext, useContext } from 'react'

const SupabaseContext = createContext({})

export function SupabaseProvider({ children }){
    return (
        <SupabaseContext.Provider value={{}}>
            {children}
        </SupabaseContext.Provider>
    )
}

export function useSupabase(){
    return useContext(SupabaseContext)
}
