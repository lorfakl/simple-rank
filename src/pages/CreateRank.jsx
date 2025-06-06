import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { useNavigate } from 'react-router';
import ProtoRank from "../components/ProtoRank"
import LimitedTextArea from '../components/LimitedTextArea';
import ConfirmationModel from '../components/ConfirmationModal';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { Droppable, DragDropContext } from '@hello-pangea/dnd';
import { useSupabase } from '../contexts/SupabaseContext';
import { useUser } from '../contexts/UserContext';
import { rankingService } from '../api/services';
import { AddRankItemModal } from '../components/AddRankItemModal';

const RANKING_NAMESPACE = '4e4a4cd7-8a00-42d7-a202-855d413d5e6a'
const RANK_ITEM_NAMESPACE = '312f0e69-5835-4b88-94c1-03d62ecb2f63'

function CreateRank(){

    const [itemCount, setItemCount] = useState(0)
    const [loading, setLoading] = useState(false)
    const [protoRanks, setProtoRanks] = useState([])
    const [protoRanking, setProtoRanking] = useState({ title: "", description: ""})
    const [requireTitle, setRequireTitle] = useState(false)
    const [requireRankItemTitle, setRequireRankItemTitle] = useState(false)
    
    const createdRanks = useRef({})
    const rankItemTitleErrors = useRef({})
    const previousItemCount = useRef(0)
    
    const navigate = useNavigate()
    const supabase = useSupabase()
    const { user } = useUser()

    useEffect(() => {

        // if(itemCount > 0 && previousItemCount.current !== undefined && itemCount > previousItemCount.current)
        // {
        //     let protoRank = getNewProtoRank()
        //     setProtoRanks([...protoRanks, protoRank])
        //     createdRanks.current[protoRank.id] = protoRank
        //     console.log(itemCount, "<- item count", createdRanks.current)
        //     rankItemTitleErrors.current[protoRank.id] = false
        // }
        
        //previousItemCount.current = itemCount
    }, [itemCount])

    useEffect(() => {

        //console.log("Proto rank order ", protoRanks)
        

    }, [user])

    useEffect(() => {
        console.log("Current protoranking: ", protoRanking)
    }, [protoRanking])

    //*Supabase Operations*//
    async function SaveRank()
    {
        setLoading(true)
        try {
            console.log("Saving ranking with protoRanks: ", protoRanks)
            const response = await rankingService.createRanking({
                title: protoRanking.title,
                description: protoRanking.description,
                items: protoRanks.map(item => {
                    return {
                        id: item.id,
                        rank: item.rank,
                        name: item.title,
                        description: item.description,
                    }
                }),
            });

            setLoading(false)
            if(response.error)
            {
                console.error("Error saving ranking: ", response.error)
            }
            else
            {
                console.log("Successfully saved ranking: ", response.data)
                //navigate to the new ranking page
                if(response.data.id !== undefined)
                {
                    navigate(`/ranking/${response.data.id}`)
                }
            }
        }
        catch(error) {
            setLoading(false)
            console.error("Error saving ranking: ", error)
        }
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

        let draggedProtoRank = protoRanks[source.index]

        if(draggedProtoRank)
        {
            let reorderProtoRanks = Array.from(protoRanks)
            reorderProtoRanks.splice(source.index, 1)
            reorderProtoRanks.splice(destination.index, 0, draggedProtoRank)

            //let swappedItem = protoRanks[destination.index]
            //protoRanks[destination.index] = draggedProtoRank
            //protoRanks[source.index] = swappedItem
            reorderProtoRanks.forEach((item, index) => item.rank = index + 1)
            setProtoRanks([...reorderProtoRanks])
        }

    }

    function handleRankingTitle(rankingTitle)
    {
        if(rankingTitle.length > 0)
        {
            setRequireTitle(false)
        }
        else
        {
            setRequireTitle(true)
        }

        setProtoRanking({...protoRanking, title: rankingTitle})
    }

    function handleRankingDescription(rankingDescription)
    {
        setProtoRanking({...protoRanking, description: rankingDescription})
    }

    function handleProtoRankChanges(id, title, description)
    {
        console.log("rank item: ", id, " rank title: ", title, " rank desc: ", description)
        let rankItem = createdRanks.current[id]
        if(rankItem)
        {
            rankItem = {...rankItem, title: title, description: description}
            createdRanks.current[id] = rankItem
        }

        setProtoRanks(protoRanks.map(item => {
            if(item.id === id)
            {
                return {...item, title: title, description: description}
            }
            else
            {
                return item
            }
        }))

        if(title.length > 0)
        {
            rankItemTitleErrors.current[id] = false
            setRequireRankItemTitle(false)
        }


        console.log(createdRanks.current)
    }

    function handleSaveRankingOnClick()
    {
        console.log("Saving ranks: ", createdRanks.current)
        if(protoRanking.title.length === 0)
        {
            return
        }

        //check each rank for a title
        const rankItemKeys = Object.keys(createdRanks.current)
        console.log("Keys in obj ", rankItemKeys, createdRanks.current)
        for(const key of rankItemKeys)
        {
            //console.log("looking for key ", key)
            if(createdRanks.current[key]) //check if an object exists for the given key
            {
                //console.log(key, " exists in obj")
                if(createdRanks.current[key].title !== undefined) //check that the title property is not undefined
                {
                    //console.log("title for ", key, " is ",  createdRanks.current[key].title)
                    if(createdRanks.current[key].title.length === 0)
                    {
                        rankItemTitleErrors.current[key] = true
                        setRequireRankItemTitle(true)
                        console.log(key, " is missing a title ", createdRanks.current[key].title)
                        return 
                    }
                }
            }
        }

        SaveRank()
    }

    function handleDiscardRankingOnClick()
    {
        console.log("Clicked discard")
        document.getElementById("discardConfirmation").showModal()
    }

    function addNewRankItem(name, desc, rank, imageurl)
    {
        let rankItem = {
            id: uuidv4(), 
            rank: rank, 
            title: name, 
            description: desc
        }
        
        createdRanks.current[rankItem.id] = rankItem
        console.log(itemCount, "<- item count", createdRanks.current)
        
        setProtoRanks([...protoRanks, rankItem])
        setItemCount(itemCount + 1)
        previousItemCount.current = itemCount
    }

    function handleAddRankItemModal(){
        let addRankModal = document.getElementById("addRankModal")
        if(addRankModal)
        {
            addRankModal.showModal()
        }
    }

    return(
        <>
            <div className="mt-18 mb-8">
                <header className="font-semibold text-3xl lg:text-5xl">create new ranking</header>
            </div>
            
            { loading? 
            <>
                <div>
                    saving new ranking: {protoRanking.title}<span className="loading loading-dots loading-lg"></span>
                </div>
            </> 
            : 
            <>
                 <div className="flex flex-col gap-y-8 items-center w-full">

                <div className="flex flex-row gap-4">
                    <button className="btn btn-soft btn-success" onClick={handleSaveRankingOnClick}><Save />save ranking</button>
                    <button className="btn btn-soft btn-error" onClick={() => {handleDiscardRankingOnClick()}}><Trash2 />discard ranking</button>
                </div>


                <LimitedTextArea inputLabel={"ranking title"} characterLimit={25} placeholderText={"title"} handleInputChange={handleRankingTitle} showRequired={true}
                initialValue={protoRanking.title} />


                <LimitedTextArea inputLabel={"ranking description"} characterLimit={75} placeholderText={"description"} handleInputChange={handleRankingDescription} 
                    initialValue={protoRanking.description}/>

                <button className="outline-dashed" onClick={() => {handleAddRankItemModal(true)}}>
                    <div className="flex flex-row items-center">
                        <Plus size={30}/>
                        <p className="font-thin lg:text-2xl text-3xl">add rank item</p>
                    </div>
                </button>
                <DragDropContext onDragEnd={handleDragEnd}>
                    <Droppable droppableId='createRank'>
                        {(provided) => (
                            <div {...provided.droppableProps} 
                                className="w-full h-120 flex flex-col border-solid rounded-xl gap-y-4 overflow-y-auto lg:gap-x-4" 
                                ref={provided.innerRef}
                            >
                                {protoRanks.map((item, index) => (
                                    // Pass the item data to your ProtoRank component
                                    <ProtoRank key={item.id} id={item.id} index={index} data={item} 
                                            onDataChange={handleProtoRankChanges}
                                            handleRemoveRankItem={removeRank} 
                                            showInputError={rankItemTitleErrors.current[item.id]}/>
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
                </div>
                <ConfirmationModel dialogId={"discardConfirmation"} modalTitle={"Discard Ranking?"} modalMessage={"Are you sure you want to discard this ranking?"} onConfirm={() => {navigate("/Home")}} onReject={() => {}}/>
                <AddRankItemModal  dialogId={"addRankModal"} onClose={()=>{console.log("Modal closed")}} onSave={addNewRankItem} totalRanks={itemCount} />
            </> 
            }
        </>
    )
}

export default CreateRank