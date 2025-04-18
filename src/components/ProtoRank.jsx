import { X } from "lucide-react"

function ProtoRank({id, data, onTitleChange, onDescriptionChange, handleRemoveRankItem}){


    return(
        <>
            <div className="flex flex-col w-full rounded-xl border-4 p-4">
                <div className="text-3xl font-semibold">Rank: {data.rank}</div>
            
                <div className="flex flex-col gap-y-4 w-full min-h">
                    <label className="floating-label w-full">
                        <input type="text" placeholder="enter name" className="input input-lg w-full" 
                            onChange={(e) => ( data.title = e.target.value)}
                        />
                        <span>item name</span>
                    </label>

                    <label className="floating-label w-full">
                        <input type="text" placeholder="enter description" className="input input-lg w-full" 
                            onChange={(e) => ( data.description = e.target.value)} 
                        />
                        <span>item description</span>
                    </label>

                </div>

                <button className="btn btn-soft btn-error mt-4" onClick={() => handleRemoveRankItem(id)}><X />Remove</button>
                
            </div>
            
        </>
    )
}

export default ProtoRank