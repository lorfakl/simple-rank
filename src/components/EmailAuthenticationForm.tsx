import React, { useState } from 'react'
import PasswordInput from './PasswordInput';
import EmailInput from './EmailInput';
import { useUser } from '../contexts/UserContext';
import type { AuthUser } from '../api/services';

interface EmailAuthenticationFormProps {
    isSignUp: boolean;
    onSuccess: (user?: AuthUser) => void;
    onFailure: (error: unknown) => void;
    loading: boolean;
    setLoading: (loading: boolean) => void;
}

function EmailAuthenticationForm({isSignUp, onSuccess, onFailure, loading, setLoading}: EmailAuthenticationFormProps)
{
    
    const [formData, setFormData] = useState({
        email: "",
        password:""
    })

    const [errors, setErrors] = useState({})
    const { signUpWithEmail, signInWithEmail } = useUser()

    function validateForm(data: { email: string; password: string })
    {
        //check that email is valid 
        //check that password is not null
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const {name, value } = e.target
        console.log("e dot target: ", e.target)
        console.log("name: ", name, " value: ", value)

        setFormData(prev => ({...prev, [name]: value}))

    }

    const handleSubmitForm = async (e: React.FormEvent<HTMLFormElement>) =>
    {
        e.preventDefault()
        setLoading(true)
        const { error, user } = isSignUp? await signUpWithEmail(formData.email, formData.password) : await signInWithEmail(formData.email, formData.password)
        if(error != undefined)
        {
            console.log("There was an error while logging in, ", error)
            onFailure(error)
        }
        else
        {
            console.log("Successfully logged in")
            onSuccess(user)
        }
    }

    return(
    <>
        <form onSubmit={handleSubmitForm}>
            <div className="flex flex-col gap-y-4">
                <EmailInput onEmailChange={handleChange}/>
                <PasswordInput onPasswordChange={handleChange}/>
                <button type="submit" className="btn btn-active btn-primary" onClick={() => {handleSubmitForm}}>
                    {loading ? <><span className="loading loading-spinner loading-md"></span></> : null}
                    {isSignUp? "Sign up" : "Login"}
                </button>
            </div>
        </form>
    </>
    )
}

export default EmailAuthenticationForm