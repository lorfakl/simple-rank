import { X, SquarePen, Trash2, Save } from "lucide-react"
import { useState, useRef, useEffect } from 'react'
function ReadOnlyRankItem({id, index, data}){

    useEffect(() => {
        if(data !== undefined && data !== null)
        {

        }
    }, [])

    return(
        <div id={id} index={index} className="flex flex-col w-full h-fit rounded-xl border-4 p-4">
            <div className="text-3xl font-semibold">rank: {data.rank}</div>
            <div className="card card-border bg-base-100 w-120 card-sm shadow-sm">
                <div className="card-body">
                    <h2 className="card-title font-bold text-xl">{data.title}</h2>
                    <p className="font-semibold text-lg text-pretty text-left">{data.description}</p>
                </div>
            </div>
        </div>
    )
}

export default ReadOnlyRankItem