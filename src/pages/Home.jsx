import { useRef, useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { DragDropContext } from "@hello-pangea/dnd";
import Rankings from "../components/Rankings"
import { rankingService } from '../api/services';
import { dateTimeHelper } from "../helper/helper";
import { useUser } from '../contexts/UserContext';
import ConfirmationModel from '../components/ConfirmationModal';
import { useNotifications } from '../contexts/NotificationContext';

function Home(){

    const [currentRankings, setCurrentRankings] = useState([])
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { showNotification } = useNotifications()

    const { user, session } = useUser()
    const rankingToDelete = useRef({ id: null, title: "" })

    useEffect(()=>{
        // console.log(programmingLanguagesRanking)
        // console.log(nationalParksRanking)
        // setCurrentRankings([programmingLanguagesRanking, nationalParksRanking])
        const getRankings = async () => {
            if(session.user.id === undefined || session.user.id === null)
            {
                console.error("User ID is not defined")
                return
            }
            await getRankingsForUser()
        }

        getRankings()
    },
    [session])

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
                showNotification("user rankings loaded", "success", 750)
            }
        }
        catch(error) {
            setLoading(false)
            console.error("Error saving ranking: ", error)
        }
        setLoading(false)
    }

    async function deleteRanking(id)
    {
        console.log("Deleting ranking with ID: ", id)
        try {
            const response = await rankingService.deleteRanking(id)
            if(response.error)
            {
                console.error("Error deleting ranking: ", response.error)
                return
            }
            console.log("successfully deleted ranking: ", response.data)
            showNotification("Ranking has been successfully deleted", "success", 750)
            setCurrentRankings(prev => prev.filter(ranking => ranking.id !== id))
        } catch (error) {
            console.error("Error deleting ranking: ", error)
        }
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

                    console.log("are these dates?", new Date(b.lastUpdated), new Date(a.lastUpdated))
                    return new Date(b.lastUpdated) - new Date(a.lastUpdated); // Sort by pinned time if both are pinned
            })
        console.log("Sorted Rankings: ", sortedRanking)
        setCurrentRankings(sortedRanking);
    }

    function onRankingDelete(id, title) {
        rankingToDelete.current = { id: id, title: title }
        console.log("Ranking to delete: ", rankingToDelete.current)
        const modal = document.getElementById("deleteConfirmation");
        if(modal)
        {
            modal.showModal()
        }
    }

    function onConfirmDelete() {
        console.log("Deleting ranking: ", rankingToDelete.current)
        deleteRanking(rankingToDelete.current.id)
    }

    function onRejectDelete() { }

    
    return(
        <>
            <div className="w-full my-18">
                    <h1 className="">my rankings</h1>
            </div>
            {
                loading ? 
                <div className="flex justify-center">
                    <p className="text-2xl font-semibold">Loading...</p>
                    <span className="loading loading-spinner loading-xl"></span>
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
                                    description={item.description} rankItems={item.items} onPinned={onRankingPinned} onDelete={onRankingDelete}/>)
                            })}

                            
                        </div>
                    </div>
                </DragDropContext>
            }
            <ConfirmationModel dialogId={"deleteConfirmation"} modalTitle={"Are you sure?"} modalMessage={`Are you sure you want to delete ranking: ${rankingToDelete.current.title}`} 
            onConfirm={onConfirmDelete} onReject={onRejectDelete} autoClose={true}/>
        </>
    )
}

export default Home