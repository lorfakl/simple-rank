import React, { createContext, useContext } from 'react'
import {createClient} from '@supabase/supabase-js'

const SupabaseContext = createContext(null)

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

export function SupabaseProvider({ children }){
    return (
        <SupabaseContext.Provider value={supabase}>
            {children}
        </SupabaseContext.Provider>
    )
}

export function useSupabase(){
    const context = useContext(SupabaseContext)

    if(!context)
    {
        throw new Error('use Supabase must be used within a SupabaseProvider')
    }
    return context
}