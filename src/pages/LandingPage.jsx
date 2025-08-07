import { useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { useUser } from '../contexts/UserContext';
import { statisticService } from '../api/services';
import { Medal, ArrowRight } from 'lucide-react';
import { Plus } from 'lucide-react';
import { programmingLanguagesRanking, nationalParksRanking } from "../components/exampledata"
import { DragDropContext } from "@hello-pangea/dnd";
import Rankings from "../components/Rankings"


function LandingPage(){

    const rankingPhrases = [
        "for weirdos that just wanna rank things...that's literally it",
        "because why not rank your favorite memes?",
        "the only ranking site that matters or exists, that I could find",
        "where your opinions are the rankings",
        "rank anything, anytime, anywhere",
        "seriously, just rank it",
        "you know you need, a live ranking of your friends"
    ];

    const tagLines = [
        "list-obsessed rankaholics",
        "tier-List tyrants",
        "orderly oddballs",
        "ranking rascals",
        "hierarchy hooligans",
        "listicle lunatics",
        "pecking-Order pundits",
        "Giga-autists"
    ]

    const { isAuthenticated } = useUser()

    const [currentRankings, setCurrentRankings] = useState([])
    const [totalRankings, setTotalRankings] = useState(-1)
    const [totalUsers, setTotalUsers] = useState(-1)
    const [bannerTagLine, setBannerTagLine] = useState("for weirdos that just wanna rank things...that's literally it")
    const [userTagLine, setUserTagLine] = useState(getRandomUserTagLine())


    const navigate = useNavigate()
    
    useEffect(()=>{
        
        const getStartingStats = async () => {
            const totalRankingsCount = await getTotalRankings();
            setTotalRankings(totalRankingsCount);
            const totalUsersCount = await getTotalUsers();
            setTotalUsers(totalUsersCount);
        }
        
        if(localStorage.getItem("auth_token") != null || localStorage.getItem("auth_token") != undefined || localStorage.getItem("auth_token") != "")
        {
            console.log(localStorage.getItem("auth_token"))
            //navigate("/Home")
        }

        getStartingStats();
    },
    [])

    useEffect(() => {
        const tagLineTimeout = setTimeout(() => {
            
            const randomTagLineIndex = Math.floor(Math.random() * tagLines.length);
            const randomPhaseIndex = Math.floor(Math.random() * rankingPhrases.length);

            setUserTagLine(tagLines[randomTagLineIndex]);
            setBannerTagLine(rankingPhrases[randomPhaseIndex]);
        }, 10000);


        return () => clearTimeout(tagLineTimeout);
    }, [userTagLine, bannerTagLine]);

    async function getTotalRankings()
    {
        try {
            const response = await statisticService.getRankingCount();
            if (response.error) {
                console.error("Error fetching total rankings:", response.error);
                return 0;
            }
            return response.data.totalCount || 0;
        } catch (error) {
            console.error("Error in getTotalRankings:", error);
            return 0;
        }
    }

    async function getTotalUsers()
    {
        try {
            const response = await statisticService.getUserCount();
            if (response.error) {
                console.error("Error fetching total users:", response.error);
                return 0;
            }
            return response.data.totalCount || 0;
        } catch (error) {
            console.error("Error in getTotalUsers:", error);
            return 0;
        }
    }

    function getRandomUserTagLine() {
        const randomIndex = Math.floor(Math.random() * tagLines.length);
        return tagLines[randomIndex];
    }


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
        {bannerTagLine}
        <br />
        </h3>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16">

            { isAuthenticated ?
                <>  
                    <button 
                        onClick={() => {navigate("/Home")}} 
                        className="group bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center">
                        go to my rankings
                        <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                </>
                :
                <button 
                    onClick={() => {navigate("/SignUp")}} 
                    className="group bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 px-8 py-4 rounded-full text-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center">
                    start ranking now
                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </button>
            }   
        </div>

        {/* Social Proof */}
        <div className="flex justify-center items-center space-x-8 text-gray-400">
            <div className="text-center">
                <div className="text-2xl font-bold text-white">
                    {totalRankings === -1 ? 
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                    </> 
                    : 
                    totalRankings}
                </div>
                <div className="text-lg">rankings created</div>
            </div>
            <div className="w-px h-12 bg-gray-600"></div>
            <div className="text-center">
                <div className="text-2xl font-bold text-white">
                    {totalUsers === -1 ? 
                    <>
                        <span className="loading loading-spinner loading-sm"></span>
                    </> 
                    : 
                    totalUsers}
                </div>
                <div className="text-lg">{userTagLine}</div>
            </div>

        </div>
        <div className="">This whole project is available on <span><a href="https://github.com/lorfakl/simple-rank">Github</a></span> there's no logging on this so feel free to report any issues</div>
    </>
    )
}

export default LandingPage