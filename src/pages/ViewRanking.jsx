import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import RankItem from '../components/RankItem';
import ConfirmationModel from '../components/ConfirmationModal';
import ToggleTextInput from '../components/ToggleTextInput';
import { ChevronDown, Plus, RefreshCw , Earth, Lock } from 'lucide-react';
import { useState, useEffect, useRef } from "react"
import { Droppable, DragDropContext } from '@hello-pangea/dnd';
import { useSupabase } from '../contexts/SupabaseContext';
import { rankingService, rankItemService } from '../api/services';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';

function ViewRanking(){

    const [itemCount, setItemCount] = useState(0)
    const [rankItems, setRankItems] = useState([])
    const [rankingInfo, setRankingInfo] = useState({title: "", description: "", createdBy: "", lastUpdate: "", isPublic: false, isShared: false})
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [linkLoading, setLinkLoading] = useState(false)

    const createdRanks = useRef({})
    const rankItemTitleErrors = useRef({})
    const shareableLink = useRef("")
    const previousItemCount = useRef(0)

    const navigate = useNavigate()
    const supabase = useSupabase()
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
            await GetRank(id)
        }
        getCurrentRank()

    }, [])


    useEffect(() => {

        if(itemCount > 0 && previousItemCount.current !== undefined && itemCount > previousItemCount.current)
        {
            let protoRank = getNewProtoRank()
            setRankItems([...rankItems, protoRank])
            createdRanks.current[protoRank.itemId] = protoRank
            console.log(itemCount, "<- item count", createdRanks.current)
            rankItemTitleErrors.current[protoRank.itemId] = false
        }
        
        previousItemCount.current = itemCount
    }, [itemCount])


    //*Supabase Operations*//
    async function GetRank(rankingId)
    {
        setLoading(true)
        try {
            console.log("Getting current rank: ")
            const response = await rankingService.getRankingById(rankingId)

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
                setItemCount(response.data.items.length)

                for(let i = 0; i < rankItems.length; i++)
                {
                    let item = rankItems[i]
                    createdRanks.current[item.itemId] = {
                        itemId: item.itemId,
                        title: item.title,
                        description: item.description,
                        rank: item.rank
                    }
                    rankItemTitleErrors.current[item.itemId] = false
                }
                console.log("Created ranks in use ref is this updating?: ", createdRanks.current)
            }
        }
        catch(error) {
            setLoading(false)
            console.error("Error saving ranking: ", error)
        }
        setLoading(false)
    }

    async function updateRankingItem(rankingItems)
    {
        console.log("Updating ranking with the following: ", rankingItems, rankingTitle, rankingDescription)
        setUpdating(true)

        // Update the ranking in the database
        try {
            
            const response = await rankingService.editRanking({
                id: id,
                description: rankingDescription,
                title: rankingTitle,
                items: rankingItems
            })
            
            if(response.error)
            {
                console.error("Error updating ranking: ", response.error)
                showNotification("Error saving ranking ", "error", 3000)
                return
            }

            console.log("Successfully updated ranking: ", response.data)
            
        }
        catch(error) {
            console.error("Error saving ranking: ", error)
            showNotification(`Error syncing ranking information ${error}`, "error", 3000)
        }

        setUpdating(false)
    }

    async function updateBasicRankingInfo(description, title, visibility)
    {
        console.log("Saving ranking info: ", rankingInfo)
        setUpdating(true)
        // Update the ranking in the database

        try {
            const response = await rankingService.editRanking({
                id: id,
                description: description,
                title: title,
                items: [],
                isPublic: visibility
            })
            
            if(response.error)
            {
                console.error("Error updating ranking: ", response.error)
                showNotification("Error saving ranking ", "error", 3000)
                setUpdating(false)
                return
            }

            console.log("Successfully updated ranking: ", response.data)
            //showNotification("Successfully updated ranking", "success", 3000)
        }
        catch(error) {
            console.error("Error saving ranking: ", error)
            showNotification(`Error syncing ranking information ${error}`, "error", 3000)
        }
        
        setUpdating(false)
    }

    


    //*JS Functions*//
    function removeRank(idToRemove)
    {
        setItemCount( itemCount - 1)
        console.log("Removing rank item: ", idToRemove)
        delete createdRanks.current[idToRemove]
        let updatedRankList = rankItems.filter(item => item.id !== idToRemove)
        updatedRankList = updatedRankList.map((item, index) => {
            item.rank = index + 1
            return item
        })

        console.log("Updated ranks ", updatedRankList)
        setRankItems(updatedRankList)
    }

    function getNewProtoRank()
    {
        let rankItem = {
            itemId: uuidv4(), 
            rank: itemCount, 
            title: "", 
            description: "",
            isEditable: true
        }
        return rankItem 
    }

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


    function handleVisibilityOnClick()
    {
        
        console.log("Changing visibility of ranking: ", rankingInfo.title)
        // Open the confirmation modal
        const dialog = document.getElementById("changeVisibilityConfirmation")
        if(dialog)
        {
            dialog.showModal()
        }
    }

    async function handleRankEdit(idToEdit, name, description)
    {

        console.log("Editing rank item: ", idToEdit, name, description)
        let updatedRankItems = rankItems.map(item => {
            if(item.id === idToEdit)
            {
                item.title = name
                item.description = description
            }
            return item
        })

        setRankItems(updatedRankItems)

        console.log("rank items post update: ", updatedRankItems)
        // Update the createdRanks reference
        if(createdRanks.current[idToEdit])
        {
            createdRanks.current[idToEdit].title = name
            createdRanks.current[idToEdit].description = description
        }

        try{

            const request = {
                id: id,
                items: updatedRankItems.filter(item => item.title && item.title.trim() !== "")
                .map(item => ({id: item.id, name: item.title, description: item.description, rank: item.rank})),
                title: rankingInfo.title,
                description: rankingInfo.description,
                isPublic: rankingInfo.isPublic
            }

            const response = await rankingService.editRanking(request)

            if(response.error)
            {
                console.error("Error updating rank items: ", response.error)
                showNotification("Error updating rank items", "error", 3000)
                return
            }
            else
            {
                console.log("Successfully updated rank items: ", response.data)
                showNotification("Successfully updated rank items", "success", 750)
            }
        }
        catch(error) {
            console.error("Error updating rank item title errors: ", error)
        }
    }

    async function handleRankRemoval(idToRemove)
    {
        let rankObjectToRemove = createdRanks.current[idToRemove]
        console.log("Dont think these are kept up to date on initial load: ", createdRanks.current)
        console.log("Removing rank item: ", idToRemove)
        //removeRank(idToRemove)

        

        console.log("Does this need to be a backend call?: ", rankObjectToRemove)
        // Update the rank items in the database

        if(rankObjectToRemove.title)
        {
            const rq = {rankingId: id, rankItemId: idToRemove}
            const response = await rankItemService.deleteRankItem(rq)
            if(response.error)
            {
                console.error("Error removing rank item: ", response.error)
                showNotification("Error removing rank item", "error", 3000)
                return
            }
            else
            {
                console.log("Successfully removed rank item: ", response.data)

                // Update the createdRanks reference
                if(createdRanks.current[idToRemove])
                {
                    delete createdRanks.current[idToRemove]
                }

                setRankItems(rankItems.filter(item => item.itemId !== idToRemove)
                .map((item, index) => {
                    item.rank = index + 1
                    return item
                }))
                setItemCount(itemCount - 1)
                //showNotification("Successfully removed rank item", "success", 750)
            }
        }

        
    }

    function handleDescriptionTextChange(desc){
        console.log("Description text changed: ", desc)
        setRankingInfo({...rankingInfo, description: desc})
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

    function saveVisibility(visibilityToSet)
    {
        setRankingInfo({...rankingInfo, isPublic: visibilityToSet})
        console.log("Changing visibility to: ", visibilityToSet)
        updateBasicRankingInfo(rankingInfo.description, rankingInfo.title, visibilityToSet)
    }

    function saveDescription(desc)
    {
        console.log("Saving description: ", desc)
        setRankingInfo({...rankingInfo, description: desc})
        updateBasicRankingInfo(desc, rankingInfo.title, rankingInfo.isPublic)
    }


    return(
        <>
            <div className="mt-18 mb-8 w-full">
                
                <div className="flex flex-col gap-y-4">
                    
                    <header className="font-semibold text-3xl lg:text-5xl self-center">{rankingInfo.title}
                        {updating ? <> <span className="inline-block"> <RefreshCw  size={30} className="animate-spin" /></span></> : null}
                    </header>  
                    

                    <ToggleTextInput inputFieldLabel="Description"
                            textToDisplay={rankingInfo.description} 
                            editButtonLabel={"edit"}
                            handleFinishEdit={saveDescription}
                            handleTextInputChange={handleDescriptionTextChange}
                            showRequired={false}/>

                    <div className="flex flex-row items-center justify-between gap-x-16">
                        <div className="flex flex-row gap-x-4">
                            <p className="text-xl font-normal">Created By:</p>
                            <p className="text-xl font-semibold">{rankingInfo.createdBy}</p>
                        </div>

                        <div className="flex flex-row" >
                            
                            <button className="btn btn-secondary rounded-r-lg" onClick={handleVisibilityOnClick}>
                                <p className="text-xl font-semibold">{rankingInfo.isPublic ? "Public": "Private"}</p>
                                {rankingInfo.isPublic ? <><Earth size={32} strokeWidth={1.75} /></>: <><Lock size={32} strokeWidth={1.75} /></> }
                            </button>
                            
                            <div className="dropdown dropdown-end">
                                <div tabIndex={0} role="button" className="btn btn-secondary btn-soft rounded-l-lg" >
                                    {linkLoading? 
                                        <span className="loading loading-spinner loading-xs"></span>
                                    :    
                                        <ChevronDown />
                                    }
                                </div>
                                <ul tabIndex={0} className="dropdown-content menu bg-base-100 rounded-box z-1 w-52 p-2 shadow-sm" id="shareDropdown">
                                    <li onClick={()=>{handleShareableLinkCreation()}}><a>{rankingInfo.isShared? "Copy Shareable Link" : "Create Shareable Link"}</a></li>
                                </ul>
                            </div>
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
                        <button className="outline-dashed" onClick={() => {setItemCount( itemCount + 1)}}>
                            <div className="flex flex-row items-center">
                                <Plus size={30}/>
                                <p className="font-thin lg:text-2xl text-3xl">add rank item</p>
                            </div>
                        </button>
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
            <ConfirmationModel dialogId={"changeVisibilityConfirmation"} modalTitle={`Make Ranking ${!rankingInfo.isPublic? "Public" : "Private"}`} modalMessage={`Are you sure you want to make this ranking ${!rankingInfo.isPublic? "Public" : "Private"}`} onConfirm={() => {saveVisibility(!rankingInfo.isPublic)}} onReject={() => {}}/>
            <ConfirmationModel dialogId={"displayShareableId"} modalTitle={`Shareable Link Available`} modalMessage={`Copy this link to share this rank with others: ${shareableLink.current}`} onConfirm={() => {}} onReject={() => {}}/>

        </>
    )
}

export default ViewRanking