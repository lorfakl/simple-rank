import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import RankItem from '../components/RankItem';
import ConfirmationModel from '../components/ConfirmationModal';
import ToggleTextInput from '../components/ToggleTextInput';
import { AddRankItemModal } from '../components/AddRankItemModal';
import { ChevronDown, Plus, RefreshCw , Earth, Lock } from 'lucide-react';
import { useState, useEffect, useRef, use } from "react"
import { Droppable, DragDropContext } from '@hello-pangea/dnd';
import { useSupabase } from '../contexts/SupabaseContext';
import { rankingService, rankItemService } from '../api/services';
import { useUser } from '../contexts/UserContext';
import { useNotifications } from '../contexts/NotificationContext';
import { RankingDetails } from '../components/RankingDetails';

function ViewRanking(){

    const [itemCount, setItemCount] = useState(0)
    const [rankItems, setRankItems] = useState([])
    const [rankingInfo, setRankingInfo] = useState({title: "", description: "", createdBy: "", creationDate: "", lastUpdate: "", isPublic: false, isShared: false})
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
            // let protoRank = getNewProtoRank()
            // setRankItems([...rankItems, protoRank])
            // createdRanks.current[protoRank.itemId] = protoRank
            // console.log(itemCount, "<- item count", createdRanks.current)
            // rankItemTitleErrors.current[protoRank.itemId] = false
        }
        
        previousItemCount.current = itemCount
    }, [itemCount])

    useEffect(()=>{
        const dateString = `${new Date().toISOString()}`
        console.log(dateString)
        setRankingInfo(prev => ({...prev, lastUpdate: dateString}));
    },[rankItems])

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
                    createdBy: response.data.createdBy.displayName,
                    lastUpdate: response.data.lastUpdated,
                    creationDate: response.data.createdDate,
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

    async function updateRankingItemPlace(rankItemsArray)
    {
        console.log("Updating ranking with the following: ", rankItemsArray)
        setUpdating(true)

        // Update the ranking in the database
        try {
            let itemDict = {}
            for(let i = 0; i < rankItemsArray.length; i++)
            {
                itemDict[rankItemsArray[i].itemId] = rankItemsArray[i].rank
            }

            let rq = {
                rankingId: id,
                ItemIdToRank: itemDict
            }
            const response = await rankItemService.updateRankItemPlacement(rq)
            
            if(response.error)
            {
                console.error("Error updating ranking: ", response.error)
                showNotification("Error saving ranking ", "error", 3000)
                return
            }

            console.log("Successfully updated ranking: ", response.data)
            showNotification("Update saved", "success", 750)
            
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

    async function addRankItem(rankItem)
    {
        const request = {
            item: {
                id: rankItem.itemId,
                rank: rankItem.rank,
                name: rankItem.title,
                description: rankItem.description
            },
            rankingId: id
        }

        try
        {
            setUpdating(true)
            const response = await rankItemService.createRankItem(request)
            if(response.error)
            {
                showNotification("Error saving rank item ", "error", 1500)
            }
            else
            {
                showNotification("successfully saved rank item", "success", 750)
            }
        }
        catch(error)
        {
            showNotification("Error saving rank item ", "error", 1500)
            console.log(error)
        }
        setUpdating(false)
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
            updateRankingItemPlace(reorderRanks)
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
            if(item.itemId === idToEdit)
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
                .map(item => ({id: item.itemId, name: item.title, description: item.description, rank: item.rank})),
                title: rankingInfo.title,
                description: rankingInfo.description,
                isPublic: rankingInfo.isPublic
            }
            console.log("Request to update rank items: ", request)
            setUpdating(true)
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
            setUpdating(false)
        }
        catch(error) {
            console.error("Error updating rank item title errors: ", error)
        }
    }

    function addNewRankItem(name, desc, rank, imageurl)
    {
        let rankItem = {
            itemId: uuidv4(), 
            rank: rank, 
            title: name, 
            description: desc
        }
        
        createdRanks.current[rankItem.id] = rankItem
        console.log(itemCount, "<- item count", createdRanks.current)

        setRankItems([...rankItems, rankItem])
        setItemCount(itemCount + 1)
        
        previousItemCount.current = itemCount


        addRankItem(rankItem)
    }

    async function handleRankRemoval(idToRemove)
    {
        let rankObjectToRemove = createdRanks.current[idToRemove]
        console.log("Dont think these are kept up to date on initial load: ", createdRanks.current)
        console.log("Removing rank item: ", idToRemove)
        //removeRank(idToRemove)

        console.log("Does this need to be a backend call?: ", rankObjectToRemove)
        
        setRankItems(prev => prev.filter(item => item.itemId !== idToRemove).map((item, index) => {
                        item.rank = index + 1
                        return item}))

        setItemCount(itemCount - 1)

        if(rankObjectToRemove === undefined)
        {
            return
        }

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

    function handleAddRankItemModal(){
        let addRankModal = document.getElementById("addRankModal")
        if(addRankModal)
        {
            addRankModal.showModal()
        }
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

                    <RankingDetails createdBy={rankingInfo.createdBy} createdDate={rankingInfo.creationDate} lastupateDate={rankingInfo.lastUpdate} 
                        itemCount={rankItems.length} isPublic={rankingInfo.isPublic} isShared={rankingInfo.isShared} rankingId={id} 
                        onVisibilityClick={handleVisibilityOnClick} onCreateShareableLink={handleShareableLinkCreation} reactionIsInteractable={false}/>
                </div>
            </div>
            
            {loading ? 
            
                <>
                    <div>
                        <h2 className="">loading rank items</h2>
                        <span className="loading loading-spinner loading-xl"></span>
                    </div>
                </>
            :
                <>
                    <div className="flex flex-col gap-y-8 items-center w-full">
                        <button className="outline-dashed" onClick={handleAddRankItemModal}>
                            <div className="flex flex-row items-center">
                                <Plus size={30}/>
                                <p className="font-thin lg:text-2xl text-3xl">add rank item</p>
                            </div>
                        </button>
                        
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId='viewRanking'>
                                {(provided) => (
                                    <div {...provided.droppableProps} 
                                        className="h-120 w-120 flex flex-col border-solid rounded-xl gap-y-4 overflow-y-auto lg:gap-x-4" 
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
            <AddRankItemModal  dialogId={"addRankModal"} onClose={()=>{console.log("Modal closed")}} onSave={addNewRankItem} totalRanks={itemCount} />
        </>
    )
}

export default ViewRanking