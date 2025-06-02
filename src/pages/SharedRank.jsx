import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import RankItem from '../components/RankItem';
import ConfirmationModel from '../components/ConfirmationModal';
import ToggleTextInput from '../components/ToggleTextInput';
import { ChevronDown, Share, RefreshCw , Earth, Lock } from 'lucide-react';
import { useState, useEffect, useRef, use } from "react"
import { Droppable, DragDropContext } from '@hello-pangea/dnd';
import { useSupabase } from '../contexts/SupabaseContext';
import { rankingService, rankItemService, shareRankService } from '../api/services';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';

function SharedRank(){

    const [rankItems, setRankItems] = useState([])
    const [rankingInfo, setRankingInfo] = useState({title: "", description: "", createdBy: "", lastUpdate: "", isPublic: false, isShared: false})
    const [loading, setLoading] = useState(false)
    const [copyState, setCopyState] = useState(false)

    const shareableLink = useRef("")

    const navigate = useNavigate()
    const { showNotification } = useNotifications()
    const { id } = useParams()


    useEffect(() => {
        //load User Rank Data
        const getCurrentRank = async () => {
            if(id === undefined || id === null || id === "")
            {
                console.error("No ranking ID provided")
                return
            }
            await GetSharedRank(id)
        }
        getCurrentRank()

    }, [])

    useEffect(() => {
        if(copyState)
        {
            console.log("Copy state changed to true, blurring share dropdown")
            setTimeout(() => {
                setCopyState(false)
            }, 2000)
        }
    }, [copyState])

    //*Supabase Operations*//
    async function GetSharedRank(sharedId)
    {
        setLoading(true)
        try {
            console.log("Getting current rank: ")
            const response = await shareRankService.getSharedRanking(sharedId)

            setLoading(false)
            if(response.error)
            {
                console.error("Error getting ranking: ", response.error)
                return
            }
    
            console.log("Successfully got ranking: ", response.data)
            //navigate to the new ranking page
            if(response.data !== undefined)
            {
                const rankItems = response.data.items.map(item => ({itemId: item.itemId, title: item.name, description: item.description, rank: item.rank}))

                setRankItems(rankItems)
                setRankingInfo({
                    title: response.data.title, 
                    description: response.data.description, 
                    createdBy: response.data.owner,
                    lastUpdate: response.data.lastUpdated,
                    isPublic: response.data.isPublic,
                    isShared: response.data.isShared
                })

            }
        }
        catch(error) {
            setLoading(false)
            console.error("Error saving ranking: ", error)
        }
        setLoading(false)
    }


    //*JS Functions*//
    function blurHtmlElement(elementId){
        const element = document.getElementById(elementId)
        if(element)
        {
            element.blur()
        }
        else
        {
            console.error("Element with ID: ", elementId, " not found")
        }
        console.log("Blurred element with ID: ", elementId)
    }

    //*User Interface Logic Functions*//
    function handleDragEnd(result)
    {
        const {destination, source, draggableId } = result
        //console.log("OnDragEnd result obj: ", result)
        if(!destination){ return }

        if(destination.index === source.index){ return }


        console.log("OnDragEnd destination obj: ", destination)
        console.log("OnDragEnd source obj: ", source)
        console.log("OnDragEnd draggableId obj: ", draggableId)

        let draggedRankItem = rankItems[source.index]

        if(draggedRankItem)
        {
            let reorderRanks = Array.from(rankItems)
            reorderRanks.splice(source.index, 1)
            reorderRanks.splice(destination.index, 0, draggedRankItem)

            //let swappedItem = protoRanks[destination.index]
            //protoRanks[destination.index] = draggedRankItem
            //protoRanks[source.index] = swappedItem
            reorderRanks.forEach((item, index) => item.rank = index + 1)
            setRankItems([...reorderRanks])
        }
    }

    async function handleShareableLinkCreation(){
        blurHtmlElement("shareDropdown")
        console.log("Creating shareable link for ranking: ", rankingInfo.isShared)

        setLinkLoading(true)
        let response = await rankingService.getShareableLink(id)
        
        console.log("Shareable link response: ", response)
        
        if(response.error)
        {
            console.error("Error creating shareable link: ", response.error)
            showNotification("Error creating shareable link", "error", 3000)
            setLinkLoading(false)
            return
        }
        else
        {
            console.log("Shareable link created: ", response.data)
            setRankingInfo({...rankingInfo, isShared: true})
            shareableLink.current = `${window.location.origin}/share/${response.data.shareableId}`

            try{
                navigator.clipboard.writeText(shareableLink.current)
                .then(() => {
                    showNotification("Shareable link copied to clipboard", "success", 2000)
                })
                .catch(err => {
                    console.error("Failed to copy shareable link: ", err)
                })
            }
            catch(error) {
                const dialog = document.getElementById("displayShareableId")
                if(dialog)
                {
                    dialog.showModal()
                }
            }
            
        }
        console.log("Shareable link: ", shareableLink.current)
        setLinkLoading(false)
    }

    async function copyShareableLinkToClipboard(){
        //blurHtmlElement("displayShareableId")
        console.log("Copying shareable link to clipboard: ", shareableLink.current)

        try{
            await navigator.clipboard.writeText(shareableLink.current)
            showNotification("Shareable link copied to clipboard", "success", 2000)
        }
        catch(error) {
            console.error("Failed to copy shareable link: ", error)
            showNotification("Failed to copy shareable link", "error", 3000)
        }
    }

    return(
        <>
            <div className="mt-18 mb-8 w-full">
                
                <div className="flex flex-col gap-y-4">
                    
                    <h1 className="font-semibold text-3xl lg:text-5xl self-center">{rankingInfo.title}</h1>
                    <h2 className="text-xl font-normal self-center">{rankingInfo.description}</h2>  

                    <div className="flex flex-row items-center justify-between gap-x-16">
                        <div className="flex flex-row gap-x-4">
                            <p className="text-xl font-normal">created by:</p>
                            <p className="text-xl font-semibold">{rankingInfo.createdBy}</p>
                        </div>

                        <div className="flex flex-row gap-x-4">
                            <p className="text-xl font-normal">last update:</p>
                            <p className="text-xl font-semibold">{rankingInfo.lastUpdate}</p>
                        </div>

                        <div className="flex flex-row" >
                            <button className={`btn btn-soft rounded-r-lg ${copyState ? "btn-success" : "btn-secondary" }` } onClick={copyShareableLinkToClipboard}>
                                <p className="text-xl font-semibold">{copyState? "Link Copied" : "Shared"}</p>
                                <Share />
                            </button>
                        </div>

                        <div className="flex flex-row gap-x-4">
                            <p className="text-xl font-normal">items:</p>
                            <p className="text-xl font-semibold">{rankItems.length}</p>
                        </div>
                    </div>
                </div>
            </div>
            
            {loading ? 
            
                <>
                    <div>
                        <h2 className="">Loading Rank Items</h2>
                        <span className="loading loading-spinner loading-xl"></span>
                    </div>
                </>
            :
                <>
                    <div className="flex flex-col gap-y-8 items-center w-full">
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId='viewRanking'>
                                {(provided) => (
                                    <div {...provided.droppableProps} 
                                        className="w-fit h-120 flex flex-col border-solid rounded-xl gap-y-4 overflow-y-auto lg:gap-x-4" 
                                        ref={provided.innerRef}
                                    >
                                        {rankItems.map((item, index) => (
                                            // Pass the item data to your ProtoRank component
                                            
                                            <RankItem key={item.itemId} id={item.itemId} index={index} data={item} isEditable={item.isEditable}
                                                onDataChange={handleRankEdit} handleRemoveRankItem={handleRankRemoval}/>
                                        ))}
                                        {provided.placeholder}
                                    </div>
                                )}
                            </Droppable>
                        </DragDropContext>
                    </div>
                </>
            }
        </>
    )
}

export default SharedRank