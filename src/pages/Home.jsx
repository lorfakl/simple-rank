import { useEffect, useState } from "react"
import { programmingLanguagesRanking, nationalParksRanking } from "../components/exampledata"
import Rankings from "../components/Rankings"
function Home(){

    const [currentRankings, setCurrentRankings] = useState([])

    useEffect(()=>{
        console.log(programmingLanguagesRanking)
        console.log(nationalParksRanking)
        setCurrentRankings([programmingLanguagesRanking, nationalParksRanking])
    },
    [])

    return(
        <>
            <div className="min-h-screen min-w-screen flex flex-col justify-center lg:flex flex-row lg:flex flex-wrap">
                {
                    currentRankings.map((item)=>{
                    return(<Rankings title={item.title} description={item.description} rankItems={item.items}/>)
                })}
            </div>
        </>
    )
}

export default Home