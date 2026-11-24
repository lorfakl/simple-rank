import { X } from "lucide-react"
import { Draggable } from "@hello-pangea/dnd"
import LimitedTextInput from "./LimitedTextInput"
import {use, useRef } from 'react'
interface ProtoRankData {
    id: string;
    rank: number;
    title: string;
    description: string;
}

interface ProtoRankProps {
    id: string;
    index: number;
    data: ProtoRankData;
    onDataChange: (id: string, title: string, description: string) => void;
    handleRemoveRankItem: (id: string) => void;
    showInputError?: boolean;
}

function ProtoRank({id, index, data, onDataChange, handleRemoveRankItem, showInputError = false}: ProtoRankProps){

    const protoRankData = useRef({title: "", description: ""})

    useRef(() => {
        if(data !== undefined && data !== null)
        {
            protoRankData.current = {...protoRankData.current, title: data.title, description: data.description}
        }
    })


    function handleRankItemTitleChange(titleText: string)
    {
        protoRankData.current = {...protoRankData.current, title: titleText}
        onDataChange(id, protoRankData.current.title, protoRankData.current.description)
    }

    function handleRankItemDescriptionChange(descriptionText: string)
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
                    className="surface flex w-full h-fit flex-col rounded-box border border-base-300 bg-base-100 p-4 shadow-soft hover:bg-base-200/60">
                    <div className="rank-chip mb-1 self-start text-base">rank: {data.rank}</div>
                
                    <LimitedTextInput inputLabel={"item name"} characterLimit={150} placeholderText={"enter rank item name"} 
                        handleInputChange={handleRankItemTitleChange} 
                        textSize={"text-xl"} showRequired={showInputError}
                        textValue={data.title}/>

                    <LimitedTextInput inputLabel={"item description"} characterLimit={255} placeholderText={"enter rank item description"} 
                        handleInputChange={handleRankItemDescriptionChange} 
                        textSize={"text-xl"}
                        textValue={data.description} />
                    <button className="btn btn-soft btn-error mt-4 transition duration-150" onClick={() => handleRemoveRankItem(id)}><X />remove</button>
                </div>
            )}
        </Draggable>
    )
}

export default ProtoRank