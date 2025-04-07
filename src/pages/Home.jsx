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
        <div className="py-8 flex flex-row">
            <div className="w-full text-blue-600">
                <h1 className="text-blue-600">My Rankings</h1>
            </div>
            
                
            <div className="fixed left-0 px-8 flex flex-col w-full h-full justify-center gap-4 lg:grid lg:grid-cols-4 bg-slate-100">
                {
                    currentRankings.map((item)=>{
                    return(<Rankings title={item.title} description={item.description} rankItems={item.items}/>)
                })}
            </div>
        </div>
            
            
            
        </>
    )
}

export default Home