import { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import LimitedTextInput from './LimitedTextInput';
import LimitedTextArea from './LimitedTextArea';

export function EditRankDetailsModal({ dialogId, onClose, onSave, rankTitle, rankDescription}) {

  const [title, setTitle] = useState(rankTitle);
  const [description, setDescription] = useState(rankDescription);
  const [error, setError] = useState("");

  useEffect(() => {
    setTitle(rankTitle)
    setDescription(rankDescription)
    console.log("EditRankDetailsModal initialized with title:", title, " and description:", description)
  },[rankTitle, rankDescription])

  
  function resetForm(){
    console.log("cleared")
    // Reset form
    setTitle("")
    setDescription("")
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
    onSave(title.trim(), description.trim())
    
    handleClose()
  }

  return (
    <dialog id={dialogId} className="modal">
        <div className="modal-box modal-top md:modal-middle w-full flex flex-col gap-y-6">
            
            <h3 className="font-bold text-lg">update ranking details</h3>

            <div className="w-full">
              <LimitedTextInput inputLabel={"ranking title"} characterLimit={150} handleInputChange={setTitle} textSize={"text-xl"} showRequired={false} 
                  useWidthFull={true} placeholderText={"title"} textValue={title} syncToTextValue={true}/>
            </div>
            
            <div className="w-full">
              <LimitedTextArea inputLabel={"ranking description"} characterLimit={255} placeholderText={"description"} handleInputChange={setDescription} 
                    initialValue={description} useFullWidth={true} textSize='text-xl' syncToInitialValue={true}/>
            </div>

            <div className="flex flex-row gap-x-6 justify-between">
                <button className="btn btn-neutral" onClick={handleClose}>Close</button>
                <button className="btn btn-primary" onClick={handleSave}>Save</button>
            </div>

        </div>
        <form method="dialog" className="modal-backdrop" onClick={handleClose}>
            
        </form>
    </dialog>
  );
}