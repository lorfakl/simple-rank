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

const RANKING_NAMESPACE = '4e4a4cd7-8a00-42d7-a202-855d413d5e6a'
const RANK_ITEM_NAMESPACE = '312f0e69-5835-4b88-94c1-03d62ecb2f63'

function CreateRank(){

    const [itemCount, setItemCount] = useState(0)
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

        if(itemCount > 0 && previousItemCount.current !== undefined && itemCount > previousItemCount.current)
        {
            let protoRank = getNewProtoRank()
            setProtoRanks([...protoRanks, protoRank])
            createdRanks.current[protoRank.id] = protoRank
            console.log(itemCount, "<- item count", createdRanks.current)
            rankItemTitleErrors.current[protoRank.id] = false
        }
        
        previousItemCount.current = itemCount
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
        const { data , error } = await supabase
            .from("Ranking")
            .insert([
                { owner: user.id, ranking_id: uuidv4() }
            ])

        if(error)
        {
            console.log(error)
        }
        else
        {
            const { data, error } = await supabase
                .from("Ranking_Data")
                .insert(convert_ranks_to_rows())
        }
    }


    //*JS Functions*//
    

    function convert_ranks_to_rows()
    {
        let rowObject = {
            ranking_id : "",
            rank_item_id:"",
            rank_value:"",
            rank_name:"",
            rank_description:"",
            owner:""
        }

        let rankingData = protoRanks.map((item, index) => ({
            
        }))
        return rankingData
    }

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
            setRequireTitle(true)
            return
        }

        //check each rank for a title
        const rankItemKeys = Object.keys(createdRanks.current)
        console.log("Keys in obj ", rankItemKeys, createdRanks.current)
        for(const key of rankItemKeys)
        {
            console.log("looking for key ", key)
            if(createdRanks.current[key]) //check if an object exists for the given key
            {
                console.log(key, " exists in obj")
                if(createdRanks.current[key].title !== undefined) //check that the title property is not undefined
                {
                    console.log("title for ", key, " is ",  createdRanks.current[key].title)
                    if(createdRanks.current[key].title.length === 0)
                    {
                        rankItemTitleErrors.current[key] = true
                        setRequireRankItemTitle(true)
                        console.log(key, " is missing a title ", createdRanks.current[key].title)
                    }
                }
            }
        }


    }

    function handleDiscardRankingOnClick()
    {
        console.log("Clicked discard")
        document.getElementById("discardConfirmation").showModal()
    }

    return(
        <>
            <div className="mt-18 mb-8">
                <header className="font-semibold text-3xl lg:text-5xl">create new ranking</header>
            </div>
            
            <div className="flex flex-col gap-y-8 items-center w-full">

                <div className="flex flex-row gap-4">
                    <button className="btn btn-soft btn-success" onClick={handleSaveRankingOnClick}><Save />Save Ranking</button>
                    <button className="btn btn-soft btn-error" onClick={() => {handleDiscardRankingOnClick()}}><Trash2 />Discard Ranking</button>
                </div>


                <LimitedTextArea inputLabel={"ranking title"} characterLimit={25} placeholderText={"title"} handleInputChange={handleRankingTitle} showRequired={requireTitle} />


                <LimitedTextArea inputLabel={"ranking description"} characterLimit={75} placeholderText={"description"} handleInputChange={handleRankingDescription} />

                <button className="outline-dashed" onClick={() => {setItemCount( itemCount + 1)}}>
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
        </>
    )
}

export default CreateRank