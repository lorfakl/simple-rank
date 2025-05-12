import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { useNavigate } from 'react-router';
import ProtoRank from "../components/ProtoRank"
import LimitedTextArea from '../components/LimitedTextArea';
import { Plus, Save, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { createClient } from '@supabase/supabase-js'
import { Droppable, DragDropContext } from '@hello-pangea/dnd';

const supabase = createClient(import.meta.env.VITE_SUPABASE_URL, import.meta.env.VITE_SUPABASE_ANON_KEY)

const RANKING_NAMESPACE = '4e4a4cd7-8a00-42d7-a202-855d413d5e6a'
const RANK_ITEM_NAMESPACE = '312f0e69-5835-4b88-94c1-03d62ecb2f63'

function CreateRank(){

    const [itemCount, setItemCount] = useState(0)
    const [protoRanks, setProtoRanks] = useState([])
    const [protoRanking, setProtoRanking] = useState({ title: "", description: ""})
    
    const createdRanks = useRef({})
    const previousItemCount = useRef(0)
    const titleTextLimit = useRef(50)
    const descriptionTextLimit = useRef(100)

    const navigate = useNavigate()

    useEffect(() => {

        if(itemCount > 0 && previousItemCount.current !== undefined && itemCount > previousItemCount.current)
        {
            let protoRank = getNewProtoRank()
            setProtoRanks([...protoRanks, protoRank])
            createdRanks.current[protoRank.id] = protoRank
            console.log(itemCount, "<- item count", createdRanks.current)
        }
        
        previousItemCount.current = itemCount
    }, [itemCount])

    useEffect(() => {

        //console.log("Proto rank order ", protoRanks)
        

    }, [protoRanks])

    useEffect(() => {
        console.log("Current protoranking: ", protoRanking)
    }, [protoRanking])

    //*Supabase Operations*//
    async function SaveRank()
    {
        const { data , error } = await supabase
            .from("Ranking")
            .insert([
                { owner: "userId", ranking_id: "rankingId" }
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
        setProtoRanking({...protoRanking, title: rankingTitle})
    }

    function handleRankingDescription(rankingDescription)
    {
        setProtoRanking({...protoRanking, description: rankingDescription})
    }

    function handleProtoRankChanges(id, title, description)
    {
        console.log("rank item: ", id, " rank title: ", title, " rank desc: ", description)
    }

    return(
        <>
            <div className="mt-18 mb-8">
                <header className="font-semibold text-3xl lg:text-5xl">create new ranking</header>
            </div>
            
            <div className="flex flex-col gap-y-8 items-center w-full">

                <div className="flex flex-row gap-4">
                    <button className="btn btn-soft btn-success" onClick={() => {console.log(createdRanks.current)}}><Save />Save Ranking</button>
                    <button className="btn btn-soft btn-error" onClick={() => {navigate("/Home")}}><Trash2 />Discard Ranking</button>
                </div>

                <LimitedTextArea inputLabel={"ranking title"} characterLimit={25} placeholderText={"title"} handleInputChange={handleRankingTitle} />
                
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
                                            handleRemoveRankItem={removeRank} />
                                ))}
                                {provided.placeholder}
                            </div>
                        )}
                    </Droppable>
                </DragDropContext>
            </div>
        </>
    )
}

export default CreateRank