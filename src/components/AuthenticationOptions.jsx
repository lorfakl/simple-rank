import { useState } from "react"
import { useNavigate } from 'react-router';
import { useUser } from "../contexts/UserContext";
import { Medal } from 'lucide-react';
import EmailAuthenticationForm from "../components/EmailAuthenticationForm";

function AuthenticationOptions({isSignUp}){
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()
    const { signInWithGoogle, signInWithDiscord } = useUser()

    async function handleGoogleLogin() {
        await signInWithGoogle()
    }

    async function handleDiscordLogin() {
        await signInWithDiscord()
    }

    function handleAuthSuccess() {
        setLoading(false)
        navigate("/Home")
    }

    function handleAuthFailure() {
        setLoading(false)
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

            <div className="my-6 flex flex-col gap-y-4">
                <EmailAuthenticationForm
                    isSignUp={isSignUp}
                    onSuccess={handleAuthSuccess}
                    onFailure={handleAuthFailure}
                    loading={loading}
                    setLoading={setLoading}
                />
            </div>

            <div className="text-center opacity-70 text-sm mb-4">
                OAuth buttons are disabled in this local migration build.
            </div>
            <div className="flex gap-2 justify-center">
                <button className="btn btn-soft" onClick={handleGoogleLogin}>Google (disabled)</button>
                <button className="btn btn-soft" onClick={handleDiscordLogin}>Discord (disabled)</button>
            </div>
        </>
    )
}

export default AuthenticationOptions
