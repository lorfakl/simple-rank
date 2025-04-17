import { Plus } from 'lucide-react';
import { useState, useEffect } from "react"
import ProtoRank from "../components/ProtoRank"

function CreateRank(){

    const [itemCount, setItemCount] = useState(0)
    const [protoRanks, setProtoRank] = useState([{rank: 1, title: "", description: ""}])

    useEffect(() => {
        
        setProtoRank(protoRanks.push(getNewProtoRank()))
        
    }, [setItemCount])

    function incrementRanks()
    {
        setItemCount( itemCount + 1)
        console.log(itemCount)
    }

    function getNewProtoRank(currentCount)
    {
        return {rank: currentCount + 1, title: "", description: ""}
    }

    return(
        <>
            <div className="my-18 flex flex-col gap-y-8 items-center w-full">
            <label className="floating-label w-full text-4xl">
                    <textarea className="textarea lg:text-2xl lg:w-192 w-100 text-xl" placeholder="title"></textarea>
                    <span className="text-4xl">rank title</span>
                </label>

                <label className="floating-label w-full text-4xl">
                    <textarea className="textarea lg:text-2xl lg:w-192 w-100 h-20 text-xl" placeholder="description"></textarea>
                    <span className="">rank description</span>
                </label>
                
                <button className="outline-dashed" onClick={() => incrementRanks()}>
                        <div className="flex flex-row items-center">
                            <Plus size={30}/>
                            <p className="font-thin lg:text-2xl text-3xl">add rank item</p>
                        </div>
                </button>

                <div className="h-3/4 border-solid rounded-xl">
                    {protoRanks.map((item,index) => {
                        return(<><ProtoRank /> </>)
                    })}
                </div>
            </div>
        </>
    )
}

export default CreateRank