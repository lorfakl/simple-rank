export function ReactionDisplay({like, love, laugh, sad, angry, wow}){

    const REACTION_TYPES = {
        like: { emoji: '👍', label: 'Like', color: '#1877f2' },
        love: { emoji: '❤️', label: 'Love', color: '#e91e63' },
        laugh: { emoji: '😂', label: 'Haha', color: '#f7b928' },
        wow: { emoji: '😮', label: 'Wow', color: '#f7b928' },
        sad: { emoji: '😢', label: 'Sad', color: '#f7b928' },
        angry: { emoji: '😡', label: 'Angry', color: '#e94b3c' }
    }

    function getCount(key)
    {
        switch(key) {
            case "like":
                console.log(like)
                return like
                
            case "love":
                console.log(love)
                return love
                
            case "laugh":
                console.log(laugh)
                return laugh
                
            case "wow":
                console.log(wow)
                return wow
                
            case "sad":
                console.log(sad)
                return sad
                
            case "angry":
                console.log(angry)
                return angry
                
            default:
                return undefined
        }
    }

    return(<>
        <div className="flex flex-row my-6 place-self-center">
            <ul class="flex flex-row  space-x-8 rounded-lg border-2 bg-white p-1">
                {Object.entries(REACTION_TYPES).map(([type, config]) => (
                    <div key={type} className="text-3xl flex flex-row " title={config.label}>
                        <div >{config.emoji}</div>
                        <div className="text-stone-950">{getCount(type)}</div>
                    </div>
                ))}
            </ul>
            
        </div>
    </>)
}