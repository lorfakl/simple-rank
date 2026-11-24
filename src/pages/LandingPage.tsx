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
            setBannerTagLine(rankingPhrases[randomPhaseIndex]!);
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
        {/* full-bleed landing wash: tint spans edge to edge, top to bottom,
            so the centered hero card rests on a tinted page backdrop */}
        <div className="hero-glow w-full min-h-svh">
        <div className="w-full my-18">
        </div>
        <div className="w-full flex flex-col">
        </div>

        {/* hero — the one signature gradient lives on the page, not the card */}
        <section className="rise-in mx-auto mb-10 w-full max-w-3xl rounded-box border border-base-300 bg-base-100 px-6 py-14 text-center shadow-soft sm:px-10">

            {/* Logo/Brand */}
            <div className="flex justify-center items-center gap-3 mb-6">
                <span className="flex items-center justify-center rounded-xl bg-primary p-3 shadow-soft">
                    <Medal className="w-8 h-8 text-primary-content" />
                </span>
                <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-base-content">
                    simple rank
                </h1>
            </div>

            {/* Hero Headline */}
            <h3 className="mx-auto mb-8 max-w-xl text-lg md:text-2xl font-medium leading-snug text-base-content/75">
            {bannerTagLine}
            </h3>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">

                { isAuthenticated ?
                    <>
                        <button
                            onClick={() => {navigate("/Home")}}
                            className="btn btn-primary btn-lg rounded-full px-8 shadow-soft btn-lift group">
                            go to my rankings
                            <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                        </button>
                    </>
                    :
                    <button
                        onClick={() => {navigate("/SignUp")}}
                        className="btn btn-primary btn-lg rounded-full px-8 shadow-soft btn-lift group">
                        start ranking now
                        <ArrowRight className="ml-2 w-5 h-5 transition-transform duration-200 group-hover:translate-x-1" />
                    </button>
                }
            </div>

            {/* Social Proof — stacks below sm so long stat labels wrap at 320px */}
            <div className="flex flex-col justify-center items-center gap-4 sm:flex-row sm:gap-8 text-base-content/70">
                <div className="text-center max-w-full">
                    <div className="font-display text-2xl font-semibold text-primary">
                        {totalRankings === -1 ?
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                        </>
                        :
                        totalRankings}
                    </div>
                    <div className="text-base">rankings created</div>
                </div>
                <div className="hidden w-px h-12 bg-base-300 sm:block"></div>
                <div className="text-center max-w-full">
                    <div className="font-display text-2xl font-semibold text-primary">
                        {totalUsers === -1 ?
                        <>
                            <span className="loading loading-spinner loading-sm"></span>
                        </>
                        :
                        totalUsers}
                    </div>
                    <div className="text-base">{userTagLine}</div>
                </div>

            </div>
        </section>
        <div className="text-center text-sm font-semibold mt-4 underline">backend server hibernates to save money🤑, so if the stats don't load, please refresh.</div>
        <div className="text-center text-sm text-base-content/70">this whole project is available on <span><a className="text-primary underline underline-offset-4" href="https://github.com/lorfakl/simple-rank">github</a></span> there's no logging on this so feel free to report any issues</div>
        </div>
    </>
    )
}

export default LandingPage