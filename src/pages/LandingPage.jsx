import { useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { useSupabase } from '../contexts/SupabaseContext';
import { Plus } from 'lucide-react';
import { programmingLanguagesRanking, nationalParksRanking } from "../components/exampledata"
import { DragDropContext } from "@hello-pangea/dnd";
import Rankings from "../components/Rankings"


function LandingPage(){

    const [currentRankings, setCurrentRankings] = useState([])
    const navigate = useNavigate()
    const supabase = useSupabase()
    
    useEffect(()=>{
        console.log(programmingLanguagesRanking)
        console.log(nationalParksRanking)
        setCurrentRankings([programmingLanguagesRanking, nationalParksRanking])
    },
    [])

    return(
        <>
            <div className="w-full my-18">
                    <h1 className="">The landing page</h1>
            </div>
            <div className="w-full flex flex-col">
            <button className="btn btn-active btn-primary" onClick={() => {navigate("/SignUp")}}>Sign Up</button>
            </div>
        </>
    )
}

export default LandingPage