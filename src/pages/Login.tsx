import { useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { useSupabase } from '../contexts/SupabaseContext';
import { useUser } from "../contexts/UserContext";
import AuthenticationOptions from "../components/AuthenticationOptions";

function Login({}: Record<string, never>){
    const [showSignInOptions, setShowSignInOptions] = useState(true)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const supabase = useSupabase()
    const { user } = useUser()

    useEffect(()=>{

    }, [])
    
    return(
        <>
            <div className="mx-auto my-12 w-full max-w-md px-4">
                <div className="rounded-box border border-base-300 bg-base-100 p-6 shadow-soft">
                    <AuthenticationOptions isSignUp={false} />
                    <p className="mt-4 text-center text-sm text-base-content/70">don't have an account? <a className="font-medium text-primary underline underline-offset-4 transition duration-150" href="/Signup">sign up</a></p>
                </div>
            </div>
        </>
    )
}

export default Login