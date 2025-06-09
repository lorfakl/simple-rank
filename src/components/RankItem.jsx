import { X, SquarePen, Trash2, Save } from "lucide-react"
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
                    {...provided.dragHandleProps}
                    ref={provided.innerRef} 
                    className="flex flex-col h-fit rounded-xl border-4 p-1 bg-base-300">
                    <div className="text-3xl font-semibold">rank: {data.rank}</div>
                    {editMode? 
                        <>                            
                            <div className="card card-border bg-base-100 w-full card-sm shadow-sm">
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
                            <div className="rounded-lg text-wrap">
                                <h2 className="text-left font-bold text-xl">{data.title}</h2>
                                <p className="text-left font-bold ">{data.description}</p>
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