import { useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { useSupabase } from '../contexts/SupabaseContext';
import { Medal, ArrowRight } from 'lucide-react';
import { Plus } from 'lucide-react';
import { programmingLanguagesRanking, nationalParksRanking } from "../components/exampledata"
import { DragDropContext } from "@hello-pangea/dnd";
import Rankings from "../components/Rankings"


function LandingPage(){

    const [currentRankings, setCurrentRankings] = useState([])
    const navigate = useNavigate()
    const supabase = useSupabase()
    
    useEffect(()=>{
        if(localStorage.getItem("auth_token") != null || localStorage.getItem("auth_token") != undefined || localStorage.getItem("auth_token") != "")
        {
            console.log(localStorage.getItem("auth_token"))
            //navigate("/Home")
        }
    },
    [])


return(
    <>
        <div className="w-full my-18">
        </div>
        <div className="w-full flex flex-col">
        </div>

        {/* Logo/Brand */}
        <div className="flex justify-center items-center mb-8">
        <div className="bg-gradient-to-r from-purple-400 to-blue-400 p-3 rounded-2xl mr-4">
            <Medal className="w-8 h-8 text-white" />
        </div>
        <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text text-transparent">
            simple rank
        </h1>
        </div>

        {/* Hero Headline */}
        <h3 className="text-xl md:text-3xl font-semibold mb-6 leading-tight">
        for weirdos that just wanna do that
        <br />
        </h3>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">
            <button 
                onClick={() => {navigate("/SignUp")}} 
                className="group bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center">
                start ranking now
                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </button>
        </div>

        {/* Social Proof */}
        <div className="flex justify-center items-center space-x-8 text-gray-400">
            <div className="text-center">
                <div className="text-2xl font-bold text-white">10K+</div>
                <div className="text-sm">Rankings Created</div>
            </div>
            <div className="w-px h-12 bg-gray-600"></div>
            <div className="w-px h-12 bg-gray-600"></div>
            <div className="text-center">
                <div className="text-2xl font-bold text-white">5K+</div>
                <div className="text-sm">Happy Users</div>
            </div>
        </div>
    </>
    )
}

export default LandingPage