import { useState, useEffect, use } from "react"

function LimitedTextInput({inputLabel, characterLimit, placeholderText, handleInputChange, textSize, textValue = "", 
    showRequired = false, useWidthFull = false, syncToTextValue = false})
{
    const [inputText, setInputText] = useState(textValue)

    useEffect(() => {
        if(textValue !== "")       
        {
            setInputText(textValue)
        }
    },[])
    
    useEffect(() => {

        if(syncToTextValue)
        {
            setInputText(textValue)
        }
    }, [textValue])

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
                    {
                        inputText.length < 1 ?
                        <input 
                        type="text"
                        onChange={(e) => {handleTextInput(e.target.value)}} 
                        className={`input input-lg lg:${textSize} ${useWidthFull? "w-full": "lg:w-192 w-100 text-xl"} ${showRequired? "input-error": "" }`} 
                        placeholder={inputText == "" ? placeholderText : null}
                        value={inputText}>
                        </input>
                        :
                        <input type="text"
                            onChange={(e) => {handleTextInput(e.target.value)}} 
                            className={`input input-lg lg:${textSize} ${useWidthFull? "w-full": "lg:w-192 w-100 text-xl"} ${showRequired? "input-error": "" }`} 
                            value={inputText}>
                        </input>
                    }
                    <span className="text-4xl">{inputLabel}</span>
                    <div className={`flex w-full ${showRequired? "flex-row justify-between": "flex-row-reverse" }`}>
                    {showRequired ? 
                        <>
                            <div className="place-self-start">
                                <p className="text-error font-semibold lg:text-3xl text-xl">this field requires a value</p>
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

export default LimitedTextInput