import { useNavigate } from 'react-router';

function Rankings({id, title, description, rankItems, creator, lastUpdate})
{
    const navigate = useNavigate()

    return(
        <>
            <div className="rounded-lg flex flex-col gap-4 hover:shadow-xl cursor-pointer bg-base-500 border-4 border-red-500 lg:aspect-square" 
                  onClick={() => {navigate(`/Rank-${id}`)}}> 
                <div className="font-bold text-xl">{title}</div>
                <p className="font-semibold">{description}</p>
                <div className="flex flex-row justify-between px-2">
                    <div>Rank Items: {rankItems.length}</div>
                    <div>Creator: {creator}</div>
                </div>
                <div className="self-start px-2">{lastUpdate}</div>
            </div>
        </>
    )
}

export default Rankings