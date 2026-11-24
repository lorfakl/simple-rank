import { X, SquarePen, Trash2, Save } from "lucide-react"
import { useState, useRef, useEffect } from 'react'
function ReadOnlyRankItem({id, index, data}){

    useEffect(() => {
        if(data !== undefined && data !== null)
        {

        }
    }, [])

    return(
        <div id={id} index={index} className="surface flex w-full h-fit flex-col rounded-box border border-base-300 bg-base-100 p-4 shadow-soft hover:bg-base-200/60">
            <div className="rank-chip mb-3 self-start text-base">rank: {data.rank}</div>
            <div className="card card-border rounded-box border-base-300 bg-base-200/60 w-full max-w-120 card-sm shadow-sm">
                <div className="card-body">
                    <h2 className="card-title font-display text-xl font-semibold tracking-tight break-words">{data.title}</h2>
                    <p className="font-medium text-base-content/75 text-pretty text-left">{data.description}</p>
                </div>
            </div>
        </div>
    )
}

export default ReadOnlyRankItem