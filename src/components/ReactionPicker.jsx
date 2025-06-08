import { useState } from "react"
import { statisticService } from "../api/services"
export function ReactionPicker({onReaction, rankingId}){

    const [reactDisplay, setReactDisplay] = useState(false)
    const [reactTextDisplay, setReactTextDisplay] = useState(false)

    const [isReactionSelected, setIsReactionSelected] = useState(false)
    const [selectedReaction, setSelectedReaction] = useState({ emoji: "", label: "", color: "" })

    const REACTION_TYPES = {
        like: { emoji: '👍', label: 'Like', color: '#1877f2' },
        love: { emoji: '❤️', label: 'Love', color: '#e91e63' },
        laugh: { emoji: '😂', label: 'Haha', color: '#f7b928' },
        wow: { emoji: '😮', label: 'Wow', color: '#f7b928' },
        sad: { emoji: '😢', label: 'Sad', color: '#f7b928' },
        angry: { emoji: '😡', label: 'Angry', color: '#e94b3c' }
    }

    async function recordReaction(selection)
    {
        const isShared = window.location.href.includes("share")
        
        const request = {
            reactionId: selection.label,
            rankingId: rankingId,
            isShared: isShared
        }

        try
        {
            const response = await statisticService.recordReaction(request)
            console.log(response)
        }
        catch(error)
        {

        }        
    }

    function reactionSelectOnClick(type, config)
    {
        console.log("has been clicked ", type, config)
        setReactDisplay(false)
        setIsReactionSelected(true)
        setReactTextDisplay(true)
        
        onReaction(config)
        setSelectedReaction(config)
        
        recordReaction(config)
    }

    function closeReactPicker()
    {
        if(reactDisplay)
        {
            setReactDisplay(false)
        }
    } 

    return(<>
        <div className="flex flex-row">
            <div className="" onMouseLeave={closeReactPicker}>
                <div className="cursor-pointer bg-primary rounded-lg w-1/3 justify-self-center font-semibold text-2xl text-center" onClick={()=>{setReactDisplay(prev => !prev)}}>
                    {reactTextDisplay? "Reacted!" : "React!"}    
                    <label className={`align-middle swap swap-rotate ${isReactionSelected ? "swap-active" : ""}`}>
                        <div className="inline-block align-middle swap-on">{selectedReaction.emoji}</div>
                        <div className="swap-off">👍</div>
                    </label>
                </div>
                <ul className={`opacity-0 md:group-hover:opacity-100 ${reactDisplay? "opacity-100" : ""} transition-opacity flex flex-row space-x-4 rounded-lg border-2 bg-white`}>
                    {Object.entries(REACTION_TYPES).map(([type, config]) => (
                        <button key={type} onClick={() => {reactionSelectOnClick(type, config)}} 
                        className="text-4xl transition-transform duration-150 rounded-full hover:bg-gray-100" title={config.label}>
                            {config.emoji}
                        </button>
                    ))}
                </ul>
            </div>
        </div>
    </>)
}