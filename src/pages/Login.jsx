import { useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { useSupabase } from '../contexts/SupabaseContext';
import { useUser } from "../contexts/UserContext";
import AuthenticationOptions from "../components/AuthenticationOptions";

function Login({}){
    const [showSignInOptions, setShowSignInOptions] = useState(true)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const supabase = useSupabase()
    const { user } = useUser()

    useEffect(()=>{

    }, [])
    
    return(
        <>
            <div className="my-12 flex flex-col gap-y-4">
                <AuthenticationOptions isSignUp={false} />
                <p>Don't have an account? <a href="/Signup">Sign Up</a></p>
            </div>
        </>
    )
}

export default Login