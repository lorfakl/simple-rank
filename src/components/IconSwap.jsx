import { act, useEffect, useState } from "react"

export function IconSwap({onIcon, offIcon, defaultOn, onSwapCallback, parentControlSwap = false})
{
    const [active, setActive] = useState(defaultOn)

    useEffect(()=>{

    },[active])


    function handleOnClick()
    {
        console.log("Swap happened")
        setActive(prev => !prev)
        onSwapCallback(!active)
    }

    function handleOnClickParent()
    {
        console.log("Parent control swap happened")
        defaultOn = !defaultOn
        onSwapCallback(defaultOn)
    }
    
    return(
    <>
        {parentControlSwap? 
            <> 
                <label className={`swap swap-rotate ${defaultOn? "swap-active":""}`} onClick={handleOnClickParent}>
                    <div className="swap-on">{onIcon}</div>
                    <div className="swap-off">{offIcon}</div>
                </label>
            </> 
            : 
            <>
                <label className={`swap swap-rotate ${active? "swap-active":""}`} onClick={handleOnClick}>
                    <div className="swap-on">{onIcon}</div>
                    <div className="swap-off">{offIcon}</div>
                </label>
            </>}
        
    </>)
}