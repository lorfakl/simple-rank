import { useState, useEffect, useRef } from "react"

function LimitedTextArea({inputLabel, initialValue = "", characterLimit, placeholderText, handleInputChange, showRequired = false, 
    useFullWidth = false, syncToInitialValue = false, textSize = "text-4xl"})
{
    const [inputText, setInputText] = useState(initialValue)

    useEffect(() => {

        console.log("ranking in progress ", inputText)
        
    }, [inputText])

    useEffect(() => {
        if(syncToInitialValue)
        {
            setInputText(initialValue)
        }
        
    },[initialValue])

    function handleTextInput(inputValue)
    {
        if(inputValue.length <= characterLimit)
        {
            setInputText(inputValue)
            handleInputChange(inputValue)
        }
    }

    return(
        <>
            <div>
                <label className={`floating-label ${textSize}`}>
                    <textarea 
                        onChange={(e) => {handleTextInput(e.target.value)}} 
                        className={`textarea lg:${textSize} ${useFullWidth? "w-full" : "lg:w-192 w-100" }  text-xl ${showRequired && inputText.length === 0 ? "outline-error": "" }`} 
                        placeholder={placeholderText}
                        value={inputText}>
                        </textarea>
                    <span className={`${textSize}`}>{inputLabel}</span>
                    <div className={`flex w-full ${showRequired && inputText.length === 0? "flex-row justify-between": "flex-row-reverse" }`}>
                    {showRequired && inputText.length === 0 ? 
                        <>
                            <div className="place-self-start">
                                <p className="text-error font-semibold lg:text-3xl text-xl">all rankings require a title</p>
                            </div>
                        </> : null
                    }
                    <div className={`place-self-end px-4 lg:${textSize} text-xl`}>{inputText.length}/{characterLimit}</div>
                    </div>
                    
                </label>
            </div>
        </>
    )
}

export default LimitedTextArea