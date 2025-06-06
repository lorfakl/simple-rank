import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LimitedTextInput from './LimitedTextInput';
import LimitedTextArea from './LimitedTextArea';

export function AddRankItemModal({ dialogId, onClose, onSave, totalRanks}) {

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [rank, setRank] = useState(totalRanks)
  const [error, setError] = useState("");

  useEffect(()=>{
    if(totalRanks === undefined)
    {
        totalRanks = 0
    }
    
  },[])

  useEffect(() => {
    console.log("modal input data", title, description, imageUrl)
  },[title, description, imageUrl])

  
  function resetForm(){
    console.log("cleared")
    // Reset form
    setTitle("")
    setDescription("")
    setImageUrl("")
    setError("")
  }

  function handleClose()
  {
    document.getElementById(dialogId).close()
    onClose()
  }

  function handleSave()
  {
    resetForm()
    onSave(title.trim(), description.trim(), rank, imageUrl.trim())
    
    handleClose()
    setRank(prevRank => prevRank + 1)
  }

  function handleSaveAndClear()
  {
    onSave(title.trim(), description.trim(), rank, imageUrl.trim())
    resetForm()
    setRank(prevRank => prevRank + 1)
  }

  function handRankChange(rankValue){
    console.log("rank value ", rankValue)
    setRank(prevRank => prevRank + 1)
  }

  return (
    <dialog id={dialogId} className="modal">
        <div className="modal-box w-1/2 flex flex-col gap-y-6">
            
            <h3 className="font-bold text-lg">add new item</h3>

            <LimitedTextInput inputLabel={"item title"} characterLimit={150} handleInputChange={setTitle} textSize={"text-xl"} showRequired={false} 
                useWidthFull={true} placeholderText={"item title"} textValue={title} syncToTextValue={true}/>

            <LimitedTextArea inputLabel={"item description"} characterLimit={255} placeholderText={"description"} handleInputChange={setDescription} 
                    initialValue={description} useFullWidth={true} textSize='text-xl' syncToInitialValue={true}/>

            <label className="floating-label text-xl">
                <span>enter item rank</span>
                <input type="number" className="input validator text-xl" required placeholder={`type a number between 1 to ${totalRanks + 1}`} 
                    min="1" max={totalRanks + 1} title={`must be between be 1 ${totalRanks + 1}`} value={rank} onChange={(e)=>{handRankChange(e.target.value)}}/>

                <p className="validator-hint">{`must be between 1 ${totalRanks + 1}`}</p>
            </label>

            <div className="flex flex-row gap-x-6 justify-end">
                <button className="btn btn-neutral" onClick={handleClose}>Close</button>
                <button className="btn btn-primary" onClick={handleSave}>Save</button>
                <button className="btn btn-secondary" onClick={handleSaveAndClear}>Save and Clear</button>
            </div>

        </div>
        <form method="dialog" className="modal-backdrop" onClick={handleClose}>
            
        </form>
    </dialog>
  );
}