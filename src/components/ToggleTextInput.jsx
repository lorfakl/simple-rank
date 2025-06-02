import { useState, useEffect, useRef } from "react"
import { SquarePen, Save} from 'lucide-react';


function ToggleTextInput({inputFieldLabel, editButtonLabel, textToDisplay, handleFinishEdit, handleTextInputChange, showRequired = false, characterLimit = 100, textSize = "text-lg"}) {
    const [isEditing, setIsEditing] = useState(false)

    function handleToggle() {
        setIsEditing(!isEditing)
        if(isEditing) {
            // Save the input text when toggling off
            handleFinishEdit(textToDisplay);
        }
    }

    //inputLabel, characterLimit, placeholderText, handleInputChange, textSize, showRequired = false})

    return (
        
        <div>
            
            {
                isEditing ? 
                <>
                    <div>
                        <label className={`floating-label ${textSize}`}>
                            <input 
                                type="text"
                                onChange={(e) => {handleTextInputChange(e.target.value)}} 
                                className={`input input-lg lg:${textSize} lg:w-192 w-100 text-xl ${showRequired? "input-error": "" }`} 
                                placeholder={`Enter a ${inputFieldLabel}`}
                                value={textToDisplay}>
                                </input>
                            <span className="text-4xl">{inputFieldLabel}</span>
                            <div className={`flex w-full ${showRequired? "flex-row justify-between": "flex-row-reverse" }`}>
                                {showRequired ? 
                                    <>
                                        <div className="place-self-start">
                                            <p className="text-error font-semibold lg:text-3xl text-xl">{`A ${inputFieldLabel} is required`}</p>
                                        </div>
                                    </> : null
                                }
                                <div className={`place-self-end px-4 lg:${textSize} text-xl`}>{textToDisplay.length}/{characterLimit}</div>
                                <button className="btn btn-xs btn-primary" onClick={handleToggle}> <Save size={16} /> Save</button>
                            </div>
                        </label>
                    </div>
                    
                </>
                :
                <>
                    { textToDisplay.length < 1 ? 
                        
                        <p className="text-gray-500">{`No ${inputFieldLabel} provided`}
                            <button className="btn btn-xs btn-primary" onClick={handleToggle}> 
                                <SquarePen size={16} /> {editButtonLabel}
                            </button>
                        </p>
                        :

                        <p className={`font-semibold ${textSize}`}>{textToDisplay}
                        <span className="inline-block"> <SquarePen size={24} onClick={handleToggle}/></span>
                        </p>
                    }
                </>
            }      
        </div>
    )
}

export default ToggleTextInput