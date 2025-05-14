import { useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { DragDropContext } from "@hello-pangea/dnd";
import { useSupabase } from '../contexts/SupabaseContext';
import { validate } from "uuid";
import EmailAuthenticationForm from "../components/EmailAuthenticationForm";

function Signup({}){
    const [showSignInOptions, setShowSignInOptions] = useState(true)

    const navigate = useNavigate()
    const supabase = useSupabase()

    useEffect(()=>{

    }, [])

    function handleGoogleSignUp()
    {

    }

    function handleAppleSignUp()
    {

    }

    function handleMicrosoftSignUp()
    {

    }
    
    return(
        <>
            <div className="w-full my-18">
                    <h1>Insert Logo</h1>
                    <h1 className="">Sign Up</h1>
            </div>
            <div className="my-12 flex flex-col gap-y-4">
                {showSignInOptions ? 
                    <>
                        {/* Google */}
                        <button className="btn bg-white text-black border-[#e5e5e5]" onClick={handleGoogleSignUp}>
                        <svg aria-label="Google logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><g><path d="m0 0H512V512H0" fill="#fff"></path><path fill="#34a853" d="M153 292c30 82 118 95 171 60h62v48A192 192 0 0190 341"></path><path fill="#4285f4" d="m386 400a140 175 0 0053-179H260v74h102q-7 37-38 57"></path><path fill="#fbbc02" d="m90 341a208 200 0 010-171l63 49q-12 37 0 73"></path><path fill="#ea4335" d="m153 219c22-69 116-109 179-50l55-54c-78-75-230-72-297 55"></path></g></svg>
                        Sign up with Google
                        </button>

                        {/* Apple */}
                        <button className="btn bg-black text-white border-black" onClick={handleAppleSignUp}>
                        <svg aria-label="Apple logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1195 1195"><path fill="white" d="M1006.933 812.8c-32 153.6-115.2 211.2-147.2 249.6-32 25.6-121.6 25.6-153.6 6.4-38.4-25.6-134.4-25.6-166.4 0-44.8 32-115.2 19.2-128 12.8-256-179.2-352-716.8 12.8-774.4 64-12.8 134.4 32 134.4 32 51.2 25.6 70.4 12.8 115.2-6.4 96-44.8 243.2-44.8 313.6 76.8-147.2 96-153.6 294.4 19.2 403.2zM802.133 64c12.8 70.4-64 224-204.8 230.4-12.8-38.4 32-217.6 204.8-230.4z"></path></svg>
                        Sign up with Apple
                        </button>

                        {/* Microsoft */}
                        <button className="btn bg-[#2F2F2F] text-white border-black" onClick={handleMicrosoftSignUp}>
                        <svg aria-label="Microsoft logo" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M96 96H247V247H96" fill="#f24f23"></path><path d="M265 96V247H416V96" fill="#7eba03"></path><path d="M96 265H247V416H96" fill="#3ca4ef"></path><path d="M265 265H416V416H265" fill="#f9ba00"></path></svg>
                        Sign up with Microsoft
                        </button>

                        <button className="btn bg-white text-black border-[#e5e5e5]" onClick={() => {setShowSignInOptions(false)}}>
                            <svg aria-label="Email icon" width="16" height="16" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><g strokeLinejoin="round" strokeLinecap="round" strokeWidth="2" fill="none" stroke="black"><rect width="20" height="16" x="2" y="4" rx="2"></rect><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"></path></g></svg>
                            Sign up with Email
                        </button>

                        <p>By creating an account you agree to our <a href="https://linkToTermsofService.com">Terms of Service</a> and <a href="https://linkToTermsofService.com">Privacy Policy</a> </p>
                    </> 
                    : 
                    <>
                        
                        <EmailAuthenticationForm/>
                        <button className="btn btn-active btn-secondary" onClick={() => {setShowSignInOptions(true)}}>Choose another option</button>
                    </>
                }
            </div>
        </>
    )
}

export default Signup