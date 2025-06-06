import { ChevronDown, Plus, RefreshCw , Earth, Lock } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { Reaction } from "./Reaction"
import { statisticService } from '../api/services';
export function RankingDetails({createdBy, createdDate, lastupateDate, itemCount, isPublic, isShared, rankingId, onVisibilityClick, onCreateShareableLink, reactionIsInteractable}){

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
            const response = await statisticService.getRankStatistics(rankingId)

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

            <div className="flex flex-row items-center justify-between gap-x-16">
                <div className="flex flex-row gap-x-4">
                    <p className="text-xl font-normal">created by:</p>
                    <p className="text-xl font-semibold">{createdBy}</p>
                </div>

                <div className="flex flex-row" >
                    <button className="btn btn-secondary rounded-r-lg" onClick={() => {onVisibilityClick()}}>
                        <p className="text-xl font-semibold">{isPublic ? "public": "private"}</p>
                        {isPublic ? <><Earth size={32} strokeWidth={1.75} /></>: <><Lock size={32} strokeWidth={1.75} /></> }
                    </button>
                    
                    <div className="dropdown dropdown-end">
                        <div tabIndex={0} role="button" className="btn btn-secondary btn-soft rounded-l-lg" >
                            {linkLoading? 
                                <span className="loading loading-spinner loading-xs"></span>
                            :    
                                <ChevronDown />
                            }
                        </div>
                        <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm" id="shareDropdown">
                            <li onClick={()=>{onCreateShareableLink()}}><a>{isShared? "Copy Shareable Link" : "Create Shareable Link"}</a></li>
                        </ul>
                    </div>
                </div>
            </div>

            <div className="flex flex-row items-center justify-between gap-x-16">
                <div className="flex flex-row gap-x-4">
                    <p className="text-xl font-normal">created:</p>
                    <p className="text-xl font-semibold">{createdDate}</p>
                </div>

                <div className="flex flex-row gap-x-4">
                    <p className="text-xl font-normal">last update:</p>
                    <p className="text-xl font-semibold">{lastupateDate}</p>
                </div>
            </div> 

            <div className="flex flex-row items-center justify-between gap-x-16">
                <div className="flex flex-row gap-x-4">
                    <p className="text-xl font-normal">clones: </p>
                    <p className="text-xl font-semibold">{rankingStatictics.current.clones}</p>
                </div>

                <div className="flex flex-row gap-x-4">
                    <p className="text-xl font-normal">item count: </p>
                    <p className="text-xl font-semibold">{itemCount}</p>
                </div>
            </div> 

            <div className="flex flex-row items-center justify-between gap-x-16">
                <div className="flex flex-row gap-x-4">
                    <p className="text-xl font-normal">views: </p>
                    <p className="text-xl font-semibold">{rankingStatictics.current.views}</p>
                </div>
                
            </div>             

            <Reaction reactions={rankingStatictics.current.reactions} isInteractable={reactionIsInteractable} like={rankingStatictics.likeCount} 
                laugh={rankingStatictics.laughCount} love={rankingStatictics.loveCount} sad={rankingStatictics.sadCount} wow={rankingStatictics.wowCount}/>
        </div>
    </>)
}