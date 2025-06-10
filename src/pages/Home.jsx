import { use, useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { programmingLanguagesRanking, nationalParksRanking } from "../components/exampledata"
import { DragDropContext } from "@hello-pangea/dnd";
import Rankings from "../components/Rankings"
import { rankingService } from '../api/services';
import { dateTimeHelper } from "../helper/helper";
import { useUser } from '../contexts/UserContext';

function Home(){

    const [currentRankings, setCurrentRankings] = useState([])
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { user } = useUser()

    useEffect(()=>{
        // console.log(programmingLanguagesRanking)
        // console.log(nationalParksRanking)
        // setCurrentRankings([programmingLanguagesRanking, nationalParksRanking])
        const getRankings = async () => {
            if(user.id === undefined || user.id === null)
            {
                console.error("User ID is not defined")
                return
            }
            await getRankingsForUser()
        }

        getRankings()
    },
    [])

    useEffect(() => {

    }, [currentRankings])

    async function getRankingsForUser()
    {
        setLoading(true)
        try {
            console.log("Getting all rankings: ")
            const response = await rankingService.getUserRankings(user.id) // Replace 1 with the actual user ID

            setLoading(false)
            if(response.error)
            {
                console.error("Error saving ranking: ", response.error)
                return
            }
    
            //navigate to the new ranking page
            if(response.data !== undefined)
            {
                const rankings = response.data.map(item => ({ ...item, pinnedTime: new Date(item.pinnedTime) }));
                console.log("Successfully saved ranking: ", response.data)
                console.log("Rankings: post map", rankings)
                setCurrentRankings(rankings)
            }
        }
        catch(error) {
            setLoading(false)
            console.error("Error saving ranking: ", error)
        }
        setLoading(false)
    }

    function handleDragEnd(result) {}

    function onRankingPinned(id, pinned) {
        console.log(`Ranking with ID: ${id} was pinned: ${pinned}`)
        // Update the pinned state of the ranking in the currentRankings state
        console.log("Pre Rankings: ", currentRankings)
        let sortedRanking = currentRankings.map(ranking => ranking.id === id ? { ...ranking, isPinned: pinned, pinnedTime: new Date() } : ranking)
                .toSorted((a, b) => {
                    if (a.isPinned !== b.isPinned)
                    {
                        return b.isPinned - a.isPinned; // Sort pinned rankings first
                    } 


                    if (a.isPinned && b.isPinned)
                    {
                        return a.pinnedTime - b.pinnedTime; // Sort by pinned time if both are pinned
                    }

                    return new Date(b.lastUpdated) - new Date(a.lastUpdated); // Sort by pinned time if both are pinned
            })
        console.log("Sorted Rankings: ", sortedRanking)
        setCurrentRankings(sortedRanking);
    }

    return(
        <>
            <div className="w-full my-18">
                    <h1 className="">my rankings</h1>
            </div>
            {
                loading ? 
                <div className="flex justify-center">
                    <p className="text-2xl font-semibold">Loading...</p>
                </div> 
                : 
                <DragDropContext onDragEnd={(handleDragEnd)}>
                    <div className="my-12 flex flex-col gap-y-4">
                        <div className="px-8 flex flex-col w-full h-full justify-center gap-4 lg:grid lg:grid-cols-4">
                            
                            <button className="outline-dashed" onClick={() => {navigate("/NewRank")}}>
                                <div className="flex flex-col items-center">
                                    <Plus size={50}/>
                                    <p className="font-thin lg:text-5xl text-3xl">create a new ranking</p>
                                </div>
                            </button>

                            {
                                currentRankings.map((item, index)=>{
                                return(<Rankings key={index} id={item.id} data={item} title={item.title} 
                                    description={item.description} rankItems={item.items} onPinned={onRankingPinned}/>)
                            })}

                            
                        </div>
                    </div>
                </DragDropContext>
            }
            
        </>
    )
}

export default Home