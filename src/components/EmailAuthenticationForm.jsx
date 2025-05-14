import React, { useState } from 'react'
import PasswordInput from './PasswordInput';
import EmailInput from './EmailInput';

function EmailAuthenticationForm({onSubmitOnClick, onValidFormDataSubmit, onInvalidFormDataSubmit})
{
    
    const [formData, setFormData] = useState({
        email: "",
        password:""
    })

    const [errors, setErrors] = useState({})

    function validateForm(data)
    {
        //check that email is valid 
        //check that password is not null
    }

    const handleSubmitForm = (e) =>
    {
        e.preventDefault()
        onSubmitOnClick()

        const newErrors = validateForm(formData);
        
        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        // Submit the form
        console.log('Form data:', formData);
        // Send to API, etc.
    }

    return(
    <>
        <form onSubmit={handleSubmitForm}>
            <EmailInput/>
            <PasswordInput/>
            <button type="submit" className="btn btn-active btn-primary" onClick={() => {setShowSignInOptions(true)}}>Sign Up</button>
        </form>
    </>
    )
}

export default EmailAuthenticationForm