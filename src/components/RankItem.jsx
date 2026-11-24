import { X, SquarePen, Trash2, Save, GripHorizontal } from "lucide-react"
import { Draggable } from "@hello-pangea/dnd"
import LimitedTextInput from "./LimitedTextInput"
import { useState, useRef, useEffect } from 'react'
function RankItem({id, index, data, onDataChange, handleRemoveRankItem, isEditable = false}){

    const [editMode, setEditMode] = useState(isEditable)
    const [showError, setShowError] = useState(false)
    const [rankName, setRankName] = useState("")
    const [rankDescription, setRankDescription] = useState("")

    useEffect(() => {
        if(data !== undefined && data !== null)
        {
            setRankName(data.title)
            setRankDescription(data.description)
        }
    }, [])


    function handleRemoveOnClick(id)
    {
        setEditMode(false)
        handleRemoveRankItem(id)
    }

    function handleSaveOnClick(id)
    {
        setEditMode(false)
        onDataChange(id, rankName, rankDescription)
    }

    return(
        <Draggable draggableId={id} index={index}>
            {(provided) => (
                <div {...provided.draggableProps}
                    ref={provided.innerRef}
                    className="surface flex w-full flex-col rounded-box border border-base-300 bg-base-100 p-3 shadow-soft hover:bg-base-200/60">
                        <div className="flex flex-row  justify-between items-center gap-2" {...provided.dragHandleProps}>
                            <div className="drag-handle cursor-grab active:cursor-grabbing" >
                                <GripHorizontal className="w-8 h-8 text-base-content/40" />
                            </div>
                            <div className="rank-chip text-base">rank: {data.rank}</div>
                            <div className="drag-handle cursor-grab active:cursor-grabbing">
                                <GripHorizontal className="w-8 h-8 text-base-content/40" />
                            </div>
                        </div>
                    
                    
                    {editMode? 
                        <>                            
                            <div className="card card-border rounded-box border-base-300 bg-base-200/60 w-full card-sm shadow-sm">
                                <div className="card-body">
                                    <div className="flex flex-col">
                                        
                                        <LimitedTextInput inputLabel={"item name"} characterLimit={150}
                                            handleInputChange={setRankName} 
                                            textSize={"text-xl"} 
                                            showRequired={showError} 
                                            useWidthFull={true}
                                            placeholderText={rankName}
                                            textValue={rankName}
                                            />

                                        <LimitedTextInput inputLabel={"item description"} characterLimit={255}
                                            handleInputChange={setRankDescription} 
                                            textSize={"text-xl"} 
                                            useWidthFull={true}
                                            textValue={rankDescription}
                                            />
                                    </div>
                                    <div className="card-actions justify-between">
                                        <button className="btn btn-primary" onClick={() => {handleSaveOnClick(id)}}><Save /></button>
                                        <button className="btn btn-error" onClick={() => {setEditMode(false)}}><X/></button>
                                    </div>
                                </div>
                            </div>
                        </> 
                        :
                        <>
                            <div className="rounded-box p-1 text-wrap">
                                <h2 className="text-left font-display text-lg font-semibold tracking-tight">{data.title}</h2>
                                <p className="text-left font-medium text-base-content/75">{data.description}</p>
                                <div className="card-actions justify-between">
                                    <button className="btn btn-primary" onClick={() => {setEditMode(true)}}><SquarePen /></button>
                                    <button className="btn btn-error" onClick={() => {handleRemoveOnClick(id)}}><Trash2/></button>
                                </div>
                            </div>
                        </>
                    }
                </div>
            )}
        </Draggable>
    )
}

export default RankItem