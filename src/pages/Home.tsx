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
import type { RankingResponse } from '../api/services';
import type { DropResult } from '@hello-pangea/dnd';

/** A ranking payload as held in local state (pinnedTime materialised to Date). */
type HomeRanking = Omit<RankingResponse, 'pinnedTime'> & { pinnedTime: Date };

function Home(){

    const [currentRankings, setCurrentRankings] = useState<HomeRanking[]>([])
    const [loading, setLoading] = useState(false)

    const navigate = useNavigate()
    const { showNotification } = useNotifications()

    const { user, session } = useUser()
    const rankingToDelete = useRef<{ id: string | null; title: string }>({ id: null, title: "" })

    useEffect(()=>{
        // console.log(programmingLanguagesRanking)
        // console.log(nationalParksRanking)
        // setCurrentRankings([programmingLanguagesRanking, nationalParksRanking])
        const getRankings = async () => {
            if(!session?.user?.id)
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
            const response = await rankingService.getUserRankings(session!.user.id) // Replace 1 with the actual user ID

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

    async function deleteRanking(id: string)
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

    function handleDragEnd(result: DropResult) {}

    function onRankingPinned(id: string, pinned: boolean) {
        console.log(`Ranking with ID: ${id} was pinned: ${pinned}`)
        // Update the pinned state of the ranking in the currentRankings state
        console.log("Pre Rankings: ", currentRankings)
        let sortedRanking = currentRankings.map(ranking => ranking.id === id ? { ...ranking, isPinned: pinned, pinnedTime: new Date() } : ranking)
                .toSorted((a, b) => {
                    if (a.isPinned !== b.isPinned)
                    {
                        return (b.isPinned as number & boolean) - (a.isPinned as number & boolean); // Sort pinned rankings first
                    } 


                    if (a.isPinned && b.isPinned)
                    {
                        return (a.pinnedTime as number & Date) - (b.pinnedTime as number & Date); // Sort by pinned time if both are pinned
                    }

                    console.log("are these dates?", new Date(b.lastUpdated), new Date(a.lastUpdated))
                    return (new Date(b.lastUpdated) as number & Date) - (new Date(a.lastUpdated) as number & Date); // Sort by pinned time if both are pinned
            })
        console.log("Sorted Rankings: ", sortedRanking)
        setCurrentRankings(sortedRanking);
    }

    function onRankingDelete(id: string, title: string) {
        rankingToDelete.current = { id: id, title: title }
        console.log("Ranking to delete: ", rankingToDelete.current)
        const modal = document.getElementById("deleteConfirmation") as HTMLDialogElement | null;
        if(modal)
        {
            modal.showModal()
        }
    }

    function onConfirmDelete() {
        console.log("Deleting ranking: ", rankingToDelete.current)
        deleteRanking(rankingToDelete.current.id!)
    }

    function onRejectDelete() { }

    
    return(
        <>
            {/* one page-level wash for the signed-in grid: full-bleed, restrained,
                cards sit on the tint instead of flat base-100 */}
            <div className="home-wash w-full min-h-svh">
                <div className="w-full my-18">
                        <h1 className="tracking-tight">my rankings</h1>
                </div>
                {
                    loading ?
                    <div className="flex justify-center">
                        <p className="text-2xl font-semibold">loading...</p>
                        <span className="loading loading-spinner loading-xl"></span>
                    </div>
                    :
                    <DragDropContext onDragEnd={(handleDragEnd)}>
                        <div className="my-12 flex flex-col gap-y-4">
                            {/* 1 col mobile, 2 cols md, 4 cols lg */}
                            <div className="px-8 grid w-full grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">

                                <button className="tile-dashed flex min-h-48 flex-col items-center justify-center gap-3 p-6" onClick={() => {navigate("/NewRank")}}>
                                    <span className="tile-badge flex h-14 w-14 items-center justify-center rounded-full">
                                        <Plus size={28}/>
                                    </span>
                                    <p className="font-display text-2xl lg:text-3xl font-medium text-center">create a new ranking</p>
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
            </div>
            <ConfirmationModel dialogId={"deleteConfirmation"} modalTitle={"are you sure?"} modalMessage={`are you sure you want to delete ranking: ${rankingToDelete.current.title}`}
            onConfirm={onConfirmDelete} onReject={onRejectDelete} autoClose={true}/>
        </>
    )
}

export default Home