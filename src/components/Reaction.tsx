import { useState } from "react"

interface ReactionProps {
    reactions?: ReactionConfig[];
    isInteractable?: boolean;
    like?: number;
    love?: number;
    laugh?: number;
    sad?: number;
    angry?: number;
    wow?: number;
    onReaction: (config: ReactionConfig) => void;
}

export function Reaction({reactions, isInteractable, like, love, laugh, sad, angry, wow, onReaction}: ReactionProps){

    const [reactDisplay, setReactDisplay] = useState(false)

    const REACTION_TYPES = {
        like: { emoji: '👍', label: 'Like', color: '#1877f2' },
        love: { emoji: '❤️', label: 'Love', color: '#e91e63' },
        laugh: { emoji: '😂', label: 'Haha', color: '#f7b928' },
        wow: { emoji: '😮', label: 'Wow', color: '#f7b928' },
        sad: { emoji: '😢', label: 'Sad', color: '#f7b928' },
        angry: { emoji: '😡', label: 'Angry', color: '#e94b3c' }
    }


    function onClick(type: string, config: ReactionConfig)
    {
        console.log("has been clicked ", type, config)
        setReactDisplay(false)
        onReaction(config)
    }

    return(<>
        <div className="flex flex-row ">
            <div class="group">
                <div className="cursor-pointer bg-primary rounded-lg w-1/3 justify-self-center font-semibold text-2xl text-center" onClick={()=>{setReactDisplay(true)}}>React! 👍</div>
                <ul className={`opacity-0 md:group-hover:opacity-100 ${reactDisplay? "opacity-100" : ""} transition-opacity flex flex-row space-x-4 rounded-lg border-2 bg-white`}>
                    {Object.entries(REACTION_TYPES).map(([type, config]) => (
                        <button key={type} onClick={() => {onClick(type, config)}} 
                        className="text-4xl transition-transform duration-150 rounded-full hover:bg-gray-100" title={config.label}>
                            {config.emoji}
                        </button>
                    ))}
                </ul>
            </div>
        </div>
    </>)
}