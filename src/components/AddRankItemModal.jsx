import { useState, useEffect } from 'react';
import { X, CirclePlus, CircleMinus } from 'lucide-react';
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

  useEffect(()=>{
    setRank(totalRanks + 1)
    
  },[totalRanks])

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

  function handRankChangeButtons(rankValue, goUp ) {
    console.log("rank value ", rankValue)
    if(goUp)
    {
      if(rankValue >= totalRanks + 1)
      {
        setRank(totalRanks + 1)
        return
      }

      setRank(prevRank => prevRank + 1)
    }
    else
    {
      if(rankValue <= 1)
      {
        setRank(1)
        return
      }

      setRank(prevRank => prevRank - 1)
    }
  }

  function handRankChange(rankValue) {
    console.log(rankValue)
    console.log("rank value ", rankValue)
    
    if(rankValue === "")
    {
      setRank("")
      console.log("rank value is empty")
      return
    }

    if(rankValue >= totalRanks + 1)
    {
      setRank(totalRanks + 1)
      return
    }

    if(rankValue <= 1)
    {
      setRank(1)
      return
    }

    setRank(rankValue) 
  }

  return (
    <dialog id={dialogId} className="modal">
        <div className="modal-box modal-top md:modal-middle w-full flex flex-col gap-y-6">
            
            <h3 className="font-bold text-lg">add new item</h3>

            <div className="w-full">
              <LimitedTextInput inputLabel={"item title"} characterLimit={150} handleInputChange={setTitle} textSize={"text-xl"} showRequired={false} 
                  useWidthFull={true} placeholderText={"item title"} textValue={title} syncToTextValue={true}/>
            </div>
            
            <div className="w-full">
              <LimitedTextArea inputLabel={"item description"} characterLimit={255} placeholderText={"description"} handleInputChange={setDescription} 
                    initialValue={description} useFullWidth={true} textSize='text-xl' syncToInitialValue={true}/>
            </div>
            
            <div className='font-semibold select-none'>enter item rank</div>
            <div className="flex flex-row justify-between place-items-start gap-x-4">
              <CircleMinus className="w-10 h-10 cursor-pointer justify-self-start hover:textslate-400" onClick={() => {handRankChangeButtons(rank, false)}} />

                <label className="floating-label text-xl ">
                  
                  <input type="number" className="input validator text-4xl text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none" required
                      min="1" max={totalRanks + 1} title={`must be between be 1 ${totalRanks + 1}`} value={rank} onChange={(e)=>{handRankChange(e.target.value)}}/>
                  <p className="validator-hint">{`must be between 1 ${totalRanks + 1}`}</p>
                </label>

              <CirclePlus className="w-10 h-10 cursor-pointer" onClick={() => {handRankChangeButtons(rank, true)}} />
            </div>

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