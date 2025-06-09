import { useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { DragDropContext } from "@hello-pangea/dnd";
import { useSupabase } from '../contexts/SupabaseContext';
import { validate } from "uuid";
import AuthenticationOptions from "../components/AuthenticationOptions";

function Signup({}){
    const [showSignInOptions, setShowSignInOptions] = useState(true)

    const navigate = useNavigate()
    const supabase = useSupabase()

    useEffect(()=>{

    }, [])
    
    return(
        <>
            <div className="my-12 flex flex-col gap-y-4 place-items-center">
                <AuthenticationOptions isSignUp={true} />
                {/*<p className="text-center w-1/2">
                    By creating an account you agree to our <a href="https://linkToTermsofService.com">Terms of Service</a> and <a href="https://linkToTermsofService.com">Privacy Policy.</a> Already have an account? <a href="/Login">Login</a>
                </p>*/}
            </div>
        </>
    )
}

export default Signup