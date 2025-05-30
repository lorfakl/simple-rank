import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import RankItem from '../components/RankItem';
import ConfirmationModel from '../components/ConfirmationModal';
import ToggleTextInput from '../components/ToggleTextInput';
import { DessertIcon, Plus, RefreshCw , Earth, Lock } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { Droppable, DragDropContext } from '@hello-pangea/dnd';
import { useSupabase } from '../contexts/SupabaseContext';
import { rankingService, rankItemService } from '../api/services';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';

function ViewRanking(){

    const [itemCount, setItemCount] = useState(0)
    const [rankItems, setRankItems] = useState([])
    const [rankingInfo, setRankingInfo] = useState({title: "", description: "", createdBy: "", lastUpdate: "", isPublic: false})
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(false)

    const createdRanks = useRef({})
    const rankItemTitleErrors = useRef({})
    const previousItemCount = useRef(0)

    const navigate = useNavigate()
    const supabase = useSupabase()
    const showNotification = useNotifications()
    const { id } = useParams()


    useEffect(() => {
        //load User Rank Data
        const getCurrentRank = async () => {
            if(id === undefined || id === null || id === "")
            {
                console.error("No ranking ID provided")
                return
            }
            await GetRank(id)
        }
        getCurrentRank()

    }, [])


    useEffect(() => {

        if(itemCount > 0 && previousItemCount.current !== undefined && itemCount > previousItemCount.current)
        {
            let protoRank = getNewProtoRank()
            setRankItems([...rankItems, protoRank])
            createdRanks.current[protoRank.id] = protoRank
            console.log(itemCount, "<- item count", createdRanks.current)
            rankItemTitleErrors.current[protoRank.id] = false
        }
        
        previousItemCount.current = itemCount
    }, [itemCount])

    useEffect(() => {
        //load User Rank Data
        // const updateRanking = async () => {
        //     if(id === undefined || id === null || id === "")
        //     {
        //         console.error("No ranking ID provided")
        //         return
        //     }
        //     await updateRankingData(rankItems, rankingInfo.title, rankingInfo.description)
        // }
        // updateRanking()

    }, [rankItems])

    //*Supabase Operations*//
    async function GetRank(rankingId)
    {
        setLoading(true)
        try {
            console.log("Getting current rank: ")
            const response = await rankingService.getRankingById(rankingId)

            setLoading(false)
            if(response.error)
            {
                console.error("Error getting ranking: ", response.error)
                return
            }
    
            console.log("Successfully got ranking: ", response.data)
            //navigate to the new ranking page
            if(response.data !== undefined)
            {
                setRankItems(response.data.items)
                setRankingInfo({
                    title: response.data.title, 
                    description: response.data.description, 
                    createdBy: response.data.createdBy,
                    lastUpdate: response.data.lastUpdate
                })
                setItemCount(response.data.items.length)
            }
        }
        catch(error) {
            setLoading(false)
            console.error("Error saving ranking: ", error)
        }
        setLoading(false)
    }

    async function updateRankingData(rankingItems, rankingTitle, rankingDescription)
    {
        console.log("Updating ranking with the following: ", rankingItems, rankingTitle, rankingDescription)
        setUpdating(true)

        // Update the ranking in the database
        try {
            
            const response = await rankingService.editRanking({
                id: id,
                description: rankingDescription,
                title: rankingTitle,
                items: rankingItems
            })
            
            if(response.error)
            {
                console.error("Error updating ranking: ", response.error)
                showNotification("Error saving ranking ", "error", 3000)
                return
            }

            console.log("Successfully updated ranking: ", response.data)
            
        }
        catch(error) {
            console.error("Error saving ranking: ", error)
            showNotification(`Error syncing ranking information ${error}`, "error", 3000)
        }

        setUpdating(false)
    }

    //*JS Functions*//
    function removeRank(idToRemove)
    {
        setItemCount( itemCount - 1)
        console.log("Removing rank item: ", idToRemove)
        delete createdRanks.current[idToRemove]
        let updatedRankList = protoRanks.filter(item => item.id !== idToRemove)
        updatedRankList = updatedRankList.map((item, index) => {
            item.rank = index + 1
            return item
        })

        console.log("Updated ranks ", updatedRankList)
        setProtoRanks(updatedRankList)
    }

    function getNewProtoRank()
    {
        let rankItem = {
            id: uuidv4(), 
            rank: itemCount, 
            title: "", 
            description: "",
            isEditable: true
        }
        return rankItem 
    }

    //*User Interface Logic Functions*//
    function handleDragEnd(result)
    {
        const {destination, source, draggableId } = result
        //console.log("OnDragEnd result obj: ", result)
        if(!destination){ return }

        if(destination.index === source.index){ return }


        console.log("OnDragEnd destination obj: ", destination)
        console.log("OnDragEnd source obj: ", source)
        console.log("OnDragEnd draggableId obj: ", draggableId)

        let draggedRankItem = rankItems[source.index]

        if(draggedRankItem)
        {
            let reorderRanks = Array.from(rankItems)
            reorderRanks.splice(source.index, 1)
            reorderRanks.splice(destination.index, 0, draggedRankItem)

            //let swappedItem = protoRanks[destination.index]
            //protoRanks[destination.index] = draggedRankItem
            //protoRanks[source.index] = swappedItem
            reorderRanks.forEach((item, index) => item.rank = index + 1)
            setRankItems([...reorderRanks])
        }
    }


    function handleVisibilityOnClick()
    {
        console.log("Changing visibility of ranking: ", rankingInfo.title)
        // Open the confirmation modal
        const dialog = document.getElementById("changeVisibilityConfirmation")
        if(dialog)
        {
            dialog.showModal()
        }
    }

    function changeVisibility(visibilityToSet)
    {

    }

    function handleRankEdit(id, name, description)
    {
        console.log("Editing rank item: ", id, name, description)
        let updatedRankItems = rankItems.map(item => {
            if(item.id === id)
            {
                item.title = name
                item.description = description
            }
            return item
        })

        setRankItems(updatedRankItems)

        // Update the createdRanks reference
        if(createdRanks.current[id])
        {
            createdRanks.current[id].title = name
            createdRanks.current[id].description = description
        }
    }

    function handleRankRemoval(id)
    {
        console.log("Removing rank item: ", id)
        removeRank(id)

        // Update the createdRanks reference
        if(createdRanks.current[id])
        {
            delete createdRanks.current[id]
        }

        // Update the rank items in the database
        rankingService.updateRanking(rankingInfo.title, rankingInfo.description, rankItems, id)
            .then(response => {
                if(response.error)
                {
                    console.error("Error updating ranking: ", response.error)
                }
                else
                {
                    console.log("Successfully updated ranking after removal: ", response.data)
                }
            })
            .catch(error => {
                console.error("Error saving ranking after removal: ", error)
            })
    }

    async function saveDescription(desc)
    {
        console.log("Saving description: ", desc)
        
        // Update the ranking in the database
        try {
            const response = await rankingService.editRanking({
                id: id,
                description: desc,
                title: rankingInfo.title,
                items: rankItems.filter(item => item.title !== "")
            })
            
            if(response.error)
            {
                console.error("Error updating ranking: ", response.error)
                showNotification("Error saving ranking ", "error", 3000)
                return
            }

            console.log("Successfully updated ranking: ", response.data)
            showNotification("Successfully saved description", "success", 3000)
        }
        catch(error) {
            console.error("Error saving ranking: ", error)
            showNotification(`Error syncing ranking information ${error}`, "error", 3000)
        }
    }
    return(
        <>
        
            <div className="mt-18 mb-8 w-full">
                
                <div className="flex flex-col gap-y-4">
                    
                    <header className="font-semibold text-3xl lg:text-5xl self-center">{rankingInfo.title}
                        {updating ? <> <span className="inline-block"> <RefreshCw  size={30} className="animate-spin" /></span></> : null}
                    </header>  
                    
                    {
                        rankingInfo.description.length < 1 ?
                        
                            <ToggleTextInput inputFieldLabel="Description"
                            textToDisplay="No description provided" 
                            editButtonLabel="add one"
                            handleInputChange={(desc) => {
                                setRankingInfo({...rankingInfo, description: desc})
                            }} 
                            showRequired={false}/>
                        :
                        
                        <ToggleTextInput inputFieldLabel="Description"
                            textToDisplay={rankingInfo.description} 
                            editButtonLabel={"edit"}
                            handleInputChange={(desc) => {
                                setRankingInfo({...rankingInfo, description: desc})
                            }} 
                            handleFinishEdit={saveDescription}
                            showRequired={false}/>
                    }

                    <div className="flex flex-row items-center justify-between">
                        <div className="flex flex-row gap-x-4">
                            <p className="text-xl font-normal">Created By:</p>
                            <p className="text-xl font-semibold">{rankingInfo.createdBy}</p>
                        </div>

                        <div className="flex flex-row" onClick={handleVisibilityOnClick}>
                            <p className="text-xl font-semibold">{rankingInfo.isPublic ? "Public": "Private"}</p>
                            {rankingInfo.isPublic ? <><Earth size={32} strokeWidth={1.75} /></>: <><Lock size={32} strokeWidth={1.75} /></> }
                        </div>
                    </div>
                </div>
            </div>
            
            {loading ? 
            
                <>
                    <div>
                        <h2 className="">Loading Rank Items</h2>
                        <span className="loading loading-spinner loading-xl"></span>
                    </div>
                </>
            :
                <>
                    <div className="flex flex-col gap-y-8 items-center w-full">
                        <button className="outline-dashed" onClick={() => {setItemCount( itemCount + 1)}}>
                            <div className="flex flex-row items-center">
                                <Plus size={30}/>
                                <p className="font-thin lg:text-2xl text-3xl">add rank item</p>
                            </div>
                        </button>
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId='viewRanking'>
                                {(provided) => (
                                    <div {...provided.droppableProps} 
                                        className="w-fit h-120 flex flex-col border-solid rounded-xl gap-y-4 overflow-y-auto lg:gap-x-4" 
                                        ref={provided.innerRef}
                                    >
                                        {rankItems.map((item, index) => (
                                            // Pass the item data to your ProtoRank component
                                            
                                            <RankItem key={item.id} id={item.id} index={index} data={item} isEditable={item.isEditable}
                                                onDataChange={handleRankEdit} handleRemoveRankItem={handleRankRemoval}/>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </>
            }
            <ConfirmationModel dialogId={"changeVisibilityConfirmation"} modalTitle={`Make Ranking ${!rankingInfo.isPublic? "Public" : "Private"}`} modalMessage={`Are you sure you want to make this ranking ${!rankingInfo.isPublic? "Public" : "Private"}`} onConfirm={() => {changeVisibility(!rankingInfo.isPublic)}} onReject={() => {}}/>

        </>
    )
}

export default ViewRanking