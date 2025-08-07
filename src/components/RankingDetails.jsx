import { ChevronDown, Plus, Share, Earth, Lock } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { Reaction } from "./Reaction"
import { statisticService } from '../api/services';
import { ReactionDisplay } from './ReactionDisplay';
import { ReactionPicker } from './ReactionPicker';
import { dateTimeHelper } from '../helper/helper';
export function RankingDetails({createdBy, createdDate, lastupateDate, itemCount, isPublic, isShared, rankingId, 
    onVisibilityClick, onCreateShareableLink, onCopyShareableLink, showShareStatus = true, showReactions}){

    const [linkLoading, setLinkLoading] = useState(false)

    const rankingStatictics = useRef({})

    useEffect(()=>{
        const getStats = async () => {
            if(rankingId === undefined || rankingId === "")
            {
                return
            }
            await getRankStatistics()
        }

        getStats()
    },[])

    async function getRankStatistics()
    {
        try{

            console.log(window.location.href)
            const url = window.location.href

            const response = url.includes("share") ? await statisticService.getSharedRankStatistics(rankingId) : await statisticService.getRankStatistics(rankingId) 

            console.log(response)
            if(response.error)
            {

            }
            else
            {
                rankingStatictics.current = response.data
                console.log("stats for the ranking", rankingStatictics.current)
            }
        }
        catch(error)
        {

        }
    }

    return(<>
        <div className="flex flex-col gap-x-2">

            <div className="flex flex-row items-center justify-between md:gap-x-16 gap-x-4">
                <div className="flex flex-col md:flex-row gap-x-4">
                    <p className="text-xl font-normal">created by:</p>
                    <p className="text-xl font-semibold">{createdBy}</p>
                </div>

                {showShareStatus? 
                <>
                    <div className="flex flex-col md:flex-row" >
                        <button className="btn btn-sm md:btn-lg btn-secondary  rounded-r-lg" onClick={() => {onVisibilityClick()}}>
                            <p className="text-xl font-semibold">{isPublic ? "public": "private"}</p>
                            {isPublic ? <><Earth className="h-4 w-4 md:h-8 md:w-8" strokeWidth={1.75} /></>: <><Lock className="h-4 w-4 md:h-8 md:w-8" strokeWidth={1.75} /></> }
                        </button>
                        
                        <div className="dropdown dropdown-end self-end">
                            <div tabIndex={0} role="button" className="btn btn-sm md:btn-lg btn-secondary btn-soft rounded-l-lg" >
                                {linkLoading? 
                                    <span className="loading loading-spinner loading-xs"></span>
                                :    
                                    <ChevronDown className="h-6 w-6 md:h-8 md:w-8" />
                                }
                            </div>
                            <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm" id="shareDropdown">
                                <li onClick={()=>{onCreateShareableLink()}}><a>{isShared? "Copy Shareable Link" : "Create Shareable Link"}</a></li>
                            </ul>
                        </div>
                    </div>
                </>
                : 
                <>
                    <div className="flex flex-row" >
                        <button className={`btn btn-soft rounded-r-lg ${"btn-secondary"}` } onClick={onCopyShareableLink}>
                            <p className="text-xl font-semibold">{"Shared"}</p>
                            <Share />
                        </button>
                    </div>
                </>}
                
            </div>

            <div className="flex flex-row items-center justify-between md:gap-x-16 gap-x-4">
                <div className="flex flex-col md:flex-row gap-x-4">
                    <p className="text-xl font-normal">created:</p>
                    <p className="text-xl font-semibold">{dateTimeHelper.convertStringToLocalTime(createdDate)}</p>
                </div>

                <div className="flex flex-col md:flex-row gap-x-4">
                    <p className="text-xl font-normal">last update:</p>
                    <p className="text-xl font-semibold">{dateTimeHelper.convertStringToLocalTime(lastupateDate)}</p>
                </div>
            </div> 

            <div className="flex flex-row items-center justify-between md:gap-x-16 gap-x-4">
                <div className="flex flex-col md:flex-row gap-x-4">
                    <p className="text-xl font-normal">views: </p>
                    <p className="text-xl font-semibold">{rankingStatictics.current.views}</p>
                </div>
                

                <div className="flex flex-col md:flex-row md:gap-x-4 gap-x-2">
                    <p className="text-xl font-normal">item count: </p>
                    <p className="text-xl font-semibold md:text-2xl">{itemCount}</p>
                </div>
            </div> 

            {/*
                <div className="flex flex-row items-center justify-between gap-x-16">
                    <div className="flex flex-row gap-x-4">
                        <p className="text-xl font-normal">clones: </p>
                        <p className="text-xl font-semibold">{rankingStatictics.current.clones}</p>
                    </div>
                    
                </div> 
            */}
            {showReactions? 
            <>
                <ReactionDisplay like={rankingStatictics.likeCount} laugh={rankingStatictics.laughCount} love={rankingStatictics.loveCount} sad={rankingStatictics.sadCount} 
                wow={rankingStatictics.wowCount}/>
            </> : null}
        </div>
    </>)
}