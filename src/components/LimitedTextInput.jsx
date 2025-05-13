import { useState, useEffect } from "react"

function LimitedTextInput({inputLabel, characterLimit, placeholderText, handleInputChange, textSize, showRequired = false})
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
                <label className={`floating-label ${textSize}`}>
                    <input 
                        type="text"
                        onChange={(e) => {handleTextInput(e.target.value)}} 
                        className={`input input-lg lg:${textSize} lg:w-192 w-100 text-xl ${showRequired? "input-error": "" }`} 
                        placeholder={placeholderText}
                        value={inputText}>
                        </input>
                    <span className="text-4xl">{inputLabel}</span>
                    <div className={`flex w-full ${showRequired? "flex-row justify-between": "flex-row-reverse" }`}>
                    {showRequired ? 
                        <>
                            <div className="place-self-start">
                                <p className="text-error font-semibold lg:text-3xl text-xl">all rank item require a title</p>
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