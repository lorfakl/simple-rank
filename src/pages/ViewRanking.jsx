import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import RankItem from '../components/RankItem';
import LimitedTextArea from '../components/LimitedTextArea';
import ConfirmationModel from '../components/ConfirmationModal';
import { DessertIcon, Plus, Save, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { Droppable, DragDropContext } from '@hello-pangea/dnd';
import { useSupabase } from '../contexts/SupabaseContext';
import { rankingService } from '../api/services';
import { useUser } from '../contexts/UserContext';


function ViewRanking(){

    const [itemCount, setItemCount] = useState(0)
    const [rankItems, setRankItems] = useState([])
    const [rankingInfo, setRankingInfo] = useState({})
    const [loading, setLoading] = useState(false)

    const createdRanks = useRef({})
    const rankItemTitleErrors = useRef({})
    const previousItemCount = useRef(0)

    const navigate = useNavigate()
    const supabase = useSupabase()
    const { id } = useParams()

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
            description: ""
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

    }

    return(
        <>
            <div className="mt-18 mb-8">
                <div className="flex flex-col gap-y-4">
                    <header className="font-semibold text-3xl lg:text-5xl">{rankingInfo.title}</header>
                    <p>{rankingInfo.description}</p>
                    <div className="">
                        
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
                        {
                            
                        }
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
                                        className="w-full h-120 flex flex-col border-solid rounded-xl gap-y-4 overflow-y-auto lg:gap-x-4" 
                                        ref={provided.innerRef}
                                    >
                                        {rankItems.map((item, index) => (
                                            // Pass the item data to your ProtoRank component
                                            
                                            <RankItem key={item.id} id={item.id} index={index} data={item}
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
            
        </>
    )
}

export default ViewRanking