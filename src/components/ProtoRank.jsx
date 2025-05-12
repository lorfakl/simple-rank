import { X } from "lucide-react"
import { Draggable } from "@hello-pangea/dnd"
import LimitedTextInput from "./LimitedTextInput"
import {useRef } from 'react'
function ProtoRank({id, index, data, onDataChange, handleRemoveRankItem}){

    const protoRankData = useRef({title: "", description: ""})

    function handleRankItemTitleChange(titleText)
    {
        protoRankData.current = {...protoRankData.current, title: titleText}
        onDataChange(id, protoRankData.current.title, protoRankData.current.description)
    }

    function handleRankItemDescriptionChange(descriptionText)
    {
        protoRankData.current = {...protoRankData.current, description: descriptionText}
        onDataChange(id, protoRankData.current.title, protoRankData.current.description)
    }

    return(
        <Draggable draggableId={id} index={index}>
            {(provided) => (
                <div {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    ref={provided.innerRef} 
                    className="flex flex-col w-full h-fit rounded-xl border-4 p-4">
                    <div className="text-3xl font-semibold">Rank: {data.rank}</div>
                
                    <LimitedTextInput inputLabel={"item name"} characterLimit={50} placeholderText={"enter rank item name"} 
                        handleInputChange={handleRankItemTitleChange} 
                        textSize={"text-xl"} />

                    <LimitedTextInput inputLabel={"item description"} characterLimit={75} placeholderText={"enter rank item description"} 
                        handleInputChange={handleRankItemDescriptionChange} 
                        textSize={"text-xl"} />
                    <button className="btn btn-soft btn-error mt-4" onClick={() => handleRemoveRankItem(id)}><X />Remove</button>
                </div>
            )}
        </Draggable>
    )
}

export default ProtoRank