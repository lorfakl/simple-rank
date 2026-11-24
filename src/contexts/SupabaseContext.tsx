import React, { createContext, useContext } from 'react'

const SupabaseContext = createContext<Record<string, never>>({})

export function SupabaseProvider({ children }: { children?: React.ReactNode }){
    return (
        <SupabaseContext.Provider value={{}}>
            {children}
        </SupabaseContext.Provider>
    )
}

export function useSupabase(){
    return useContext(SupabaseContext)
}
