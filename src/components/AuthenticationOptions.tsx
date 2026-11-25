import { useState } from "react"
import { Link, useNavigate } from 'react-router';
import { useUser } from "../contexts/UserContext";
import { Medal } from 'lucide-react';
import EmailAuthenticationForm from "../components/EmailAuthenticationForm";

function AuthenticationOptions({isSignUp}: { isSignUp: boolean }){
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
            <div className="flex justify-center items-center gap-3 mb-8">
                <span className="flex items-center justify-center rounded-xl bg-primary p-3 shadow-soft">
                    <Medal className="w-8 h-8 text-primary-content" />
                </span>
                <h1 className="font-display text-4xl md:text-5xl font-semibold tracking-tight text-base-content">
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
                oauth buttons are disabled in this local migration build.
            </div>
            <p className="mb-4 text-center text-xs text-base-content/60">
                by continuing you agree to our{' '}
                <Link className="link link-primary" to="/terms">terms of service</Link>
                {' '}and{' '}
                <Link className="link link-primary" to="/privacy">privacy policy</Link>.
            </p>
            <div className="flex gap-2 justify-center">
                <button className="btn btn-soft transition duration-150" onClick={handleGoogleLogin}>google (disabled)</button>
                <button className="btn btn-soft transition duration-150" onClick={handleDiscordLogin}>discord (disabled)</button>
            </div>
        </>
    )
}

export default AuthenticationOptions
