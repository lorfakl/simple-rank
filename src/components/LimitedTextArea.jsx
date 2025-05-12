import { useState, useEffect, useRef } from "react"

function LimitedTextArea({inputLabel, characterLimit, placeholderText, handleInputChange})
{
    const [inputText, setInputText] = useState("")

    useEffect(() => {

        //console.log("Proto rank order ", protoRanks)
        
    }, [inputText])

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
                <label className="floating-label text-4xl">
                    <textarea 
                        onChange={(e) => {handleTextInput(e.target.value)}} 
                        className="textarea lg:text-2xl lg:w-192 w-100 text-xl" 
                        placeholder={placeholderText}
                        value={inputText}>
                        </textarea>
                    <span className="text-4xl">{inputLabel}</span>
                    <div className="place-self-end px-4 lg:text-4xl text-xl">{inputText.length}/{characterLimit}</div>
                </label>
            </div>
        </>
    )
}

export default LimitedTextArea