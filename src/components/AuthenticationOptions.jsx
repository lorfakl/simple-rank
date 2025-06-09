import { useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { useSupabase } from '../contexts/SupabaseContext';
import { useUser } from "../contexts/UserContext";
import { DiscordLoginButton, GoogleLoginButton } from "react-social-login-buttons";
import { Medal } from 'lucide-react';
import EmailAuthenticationForm from "../components/EmailAuthenticationForm";

function AuthenticationOptions({isSignUp}){
    const [showSignInOptions, setShowSignInOptions] = useState(true)
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const supabase = useSupabase()
    const { user, signInWithGoogle, signInWithDiscord } = useUser()

    useEffect(()=>{

    }, [])

    async function handleGoogleLogin()
    {
        try
        {
            const response = await signInWithGoogle()
            console.log("Google sign in response: ", response)
            
        }
        catch(error)
        {
            console.error("Error signing in with Google: ", error)
            setLoading(false)
            // Handle error, e.g., show a notification
        }
        

    }

    async function handleDiscordLogin()
    {
        try
        {
            const response = await signInWithDiscord()
            console.log("Google sign in response: ", response)
            
        }
        catch(error)
        {
            console.error("Error signing in with Google: ", error)
            setLoading(false)
            // Handle error, e.g., show a notification
        }
    }

    function handleMicrosoftLogin()
    {

    }

    function handleAuthSuccess(authUser)
    {
        setLoading(false)
        console.log(authUser)
        navigate("/Home")
    }

    function handleAuthFailure(error)
    {
        setLoading(false)
        console.log("authernticated error, ", error)
    }
    
    return(
        <>
            <div className="flex justify-center items-center mb-8">
                <div className="bg-gradient-to-r from-purple-400 to-blue-400 p-3 rounded-2xl mr-4">
                    <Medal className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
                    simple rank
                </h1>
            </div>
            <div className="my-12 flex flex-col gap-y-4">
                {/* Google */}
                <GoogleLoginButton onClick={handleGoogleLogin} />

                {/* Discord */}
                <DiscordLoginButton onClick={handleDiscordLogin} />

                {/* No more email/password login 
                <button className="btn bg-white text-black border-[#e5e5e5]" onClick={() => {setShowSignInOptions(false)}}>
                    <svg aria-label="Email icon" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="black"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></g></svg>
                    {isSignUp ? "Sign up" : "Login"}  with Email
                </button>*/}
            </div>
        </>
    )
}

export default AuthenticationOptions