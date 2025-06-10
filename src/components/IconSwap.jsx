import { act, useEffect, useState } from "react"

export function IconSwap({onIcon, offIcon, defaultOn, onSwapCallback})
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

    return(
    <>
        <label className={`swap swap-rotate ${active? "swap-active":""}`} onClick={handleOnClick}>
            <div className="swap-on">{onIcon}</div>
            <div className="swap-off">{offIcon}</div>
        </label>
    </>)
}