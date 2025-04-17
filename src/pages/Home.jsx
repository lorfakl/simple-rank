import { useEffect, useState } from "react"
import { useNavigate } from 'react-router';
import { Plus } from 'lucide-react';
import { programmingLanguagesRanking, nationalParksRanking } from "../components/exampledata"
import Rankings from "../components/Rankings"
function Home(){

    const [currentRankings, setCurrentRankings] = useState([])
    const navigate = useNavigate()

    useEffect(()=>{
        console.log(programmingLanguagesRanking)
        console.log(nationalParksRanking)
        setCurrentRankings([programmingLanguagesRanking, nationalParksRanking])
    },
    [])

    return(
        <>
            <div className="w-full">
                    <h1 className="">my rankings</h1>
                </div>
            <div className="my-18 flex flex-col gap-y-4">
                <div className="px-8 flex flex-col w-full h-full justify-center gap-4 lg:grid lg:grid-cols-4">
                    {
                        currentRankings.map((item, index)=>{
                        return(<Rankings id={index} title={item.title} description={item.description} rankItems={item.items} creator={"You"} lastUpdate={"Now"}/>)
                    })}

                    <button className="outline-dashed" onClick={() => {navigate("/NewRank")}}>
                        <div className="flex flex-col items-center">
                            <Plus size={50}/>
                            <p className="font-thin lg:text-5xl text-3xl">Create a New Ranking</p>
                        </div>
                    </button>
                </div>
            </div>
        </>
    )
}

export default Home