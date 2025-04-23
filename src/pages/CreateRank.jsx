import { v4 as uuidv4 } from 'uuid'
import { useNavigate } from 'react-router';
import ProtoRank from "../components/ProtoRank"
import { Plus, Save, Trash2 } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { Droppable, DragDropContext } from '@hello-pangea/dnd';

function CreateRank(){

    const [itemCount, setItemCount] = useState(0)
    const [protoRanks, setProtoRanks] = useState([])

    const createdRanks = useRef({})
    const previousItemCount = useRef(0)

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

    function handleRankItemNameUpdates(id, nameText)
    {
        //createdRanks.current[id].title = nameText
        //console.log(createdRanks.current)
    }


    function incrementRanks()
    {
        setItemCount( itemCount + 1)
        console.log(itemCount)
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

    function handleDragEnd(result)
    {

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

                <label className="floating-label text-4xl">
                    <textarea className="textarea lg:text-2xl lg:w-192 w-100 text-xl" placeholder="title"></textarea>
                    <span className="text-4xl">ranking title</span>
                </label>

                <label className="floating-label text-4xl">
                    <textarea className="textarea lg:text-2xl lg:w-192 w-100 h-20 text-xl" placeholder="description"></textarea>
                    <span className="">ranking description</span>
                </label>
                <DragDropContext onDragEnd={handleDragEnd}>
                <Droppable droppableId='createRank'>
                    {(provided) => (
                        <div {...provided.droppableProps} 
                            className="w-full h-120 flex flex-col lg:grid lg:grid-cols-5 lg:gap-x-4 border-solid rounded-xl gap-y-4 overflow-y-auto" 
                            ref={provided.innerRef}
                        >
                            {protoRanks.map((item, index) => (
                                // Pass the item data to your ProtoRank component
                                <ProtoRank key={index} id={item.id} index={index} data={item} 
                                        onTitleChange={handleRankItemNameUpdates}
                                        handleRemoveRankItem={removeRank} />
                            ))}
                            {provided.placeholder}
                        </div>
                    )}
                    
                </Droppable>
                </DragDropContext>
                
                

                <button className="outline-dashed" onClick={() => {setItemCount( itemCount + 1)}}>
                    <div className="flex flex-row items-center">
                        <Plus size={30}/>
                        <p className="font-thin lg:text-2xl text-3xl">add rank item</p>
                    </div>
                </button>
            </div>
        </>
    )
}

export default CreateRank