import { v4 as uuidv4, v5 as uuidv5 } from 'uuid'
import { useNavigate } from 'react-router';
import { useParams } from 'react-router';
import RankItem from '../components/RankItem';
import ConfirmationModel from '../components/ConfirmationModal';
import ToggleTextInput from '../components/ToggleTextInput';
import { AddRankItemModal } from '../components/AddRankItemModal';
import { ChevronDown, Plus, RefreshCw , Earth, Lock } from 'lucide-react';
import { useState, useEffect, useRef, useCallback, use } from "react"
import { Droppable, DragDropContext } from '@hello-pangea/dnd';
import { rankingService, rankItemService } from '../api/services';
import { useNotifications } from '../contexts/NotificationContext';
import { RankingDetails } from '../components/RankingDetails';
import { EditRankDetailsModal } from '../components/EditRankDetailsModal';
import type { DropResult } from '@hello-pangea/dnd';

interface ViewRankItem {
    itemId: string;
    title: string;
    description: string;
    rank: number;
    isEditable?: boolean;
}

/** Draft as built by addNewRankItem — note the pre-existing `rankItem.id`
 *  access below reads a property the literal never sets (undefined at
 *  runtime), hence the optional `id`. */
interface ViewRankItemDraft extends ViewRankItem {
    id?: string;
}

interface CreatedRankRecord {
    itemId: string;
    title: string;
    description: string;
    rank: number;
}

function ViewRanking(){

    const [itemCount, setItemCount] = useState(0)
    const [rankItems, setRankItems] = useState<ViewRankItem[]>([])
    const [rankingInfo, setRankingInfo] = useState({title: "", description: "", createdBy: "", creationDate: "", lastUpdate: "", isPublic: false, isShared: false})
    const [loading, setLoading] = useState(false)
    const [updating, setUpdating] = useState(false)
    const [linkLoading, setLinkLoading] = useState(false)

    const createdRanks = useRef<Record<string, CreatedRankRecord>>({})
    const rankItemTitleErrors = useRef<Record<string, boolean>>({})
    const shareableLink = useRef("")
    const previousItemCount = useRef(0)
    const activeRequestId = useRef(0)
    const hasLoadedRanking = useRef(false)

    const navigate = useNavigate()
    const { showNotification } = useNotifications()
    const { id } = useParams()

    const GetRank = useCallback(async (rankingId: string) =>
    {
        const requestId = ++activeRequestId.current
        setLoading(!hasLoadedRanking.current)

        try {
            console.log("Getting current rank: ")
            const response = await rankingService.getRankingById(rankingId)

            if(requestId !== activeRequestId.current)
            {
                return
            }

            if(response.error)
            {
                console.error("Error getting ranking: ", response.error)
                return
            }

            console.log("Successfully got ranking: ", response.data)
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
                hasLoadedRanking.current = true

                for(let i = 0; i < rankItems.length; i++)
                {
                    let item = rankItems[i]!
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
            if(requestId !== activeRequestId.current)
            {
                return
            }

            console.error("Error saving ranking: ", error)
        }
        finally {
            if(requestId === activeRequestId.current)
            {
                setLoading(false)
            }
        }
    }, [])

    useEffect(() => {
        if(id === undefined || id === null || id === "")
        {
            console.error("No ranking ID provided")
            return
        }

        hasLoadedRanking.current = false
        void GetRank(id)

        return () => {
            activeRequestId.current += 1
        }
    }, [GetRank, id])

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

    async function updateRankingItemPlace(rankItemsArray: ViewRankItem[])
    {
        console.log("Updating ranking with the following: ", rankItemsArray)
        setUpdating(true)

        // Update the ranking in the database
        try {
            let itemDict: Record<string, number> = {}
            for(let i = 0; i < rankItemsArray.length; i++)
            {
                itemDict[rankItemsArray[i]!.itemId] = rankItemsArray[i]!.rank
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

    async function updateBasicRankingInfo(description: string, title: string, visibility: boolean)
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

    async function addRankItem(rankItem: { itemId: string; rank: number; title: string; description: string })
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
    function blurHtmlElement(elementId: string){
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
    function handleDragEnd(result: DropResult)
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
        const dialog = document.getElementById("changeVisibilityConfirmation") as HTMLDialogElement | null
        if(dialog)
        {
            dialog.showModal()
        }
    }

    async function handleRankEdit(idToEdit: string, name: string, description: string)
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

    function addNewRankItem(name: string, desc: string, rank: number, imageurl: string)
    {
        let rankItem: ViewRankItemDraft = {
            itemId: uuidv4(), 
            rank: rank, 
            title: name, 
            description: desc
        }
        
        createdRanks.current[rankItem.id!] = rankItem
        console.log(itemCount, "<- item count", createdRanks.current)

        setRankItems([...rankItems, rankItem])
        setItemCount(itemCount + 1)
        
        previousItemCount.current = itemCount


        addRankItem(rankItem)
    }

    async function handleRankRemoval(idToRemove: string)
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
                await updateRankingItemPlace(rankItems)
                //showNotification("Successfully removed rank item", "success", 750)
            }
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
                const dialog = document.getElementById("displayShareableId") as HTMLDialogElement | null
                if(dialog)
                {
                    dialog.showModal()
                }
            }
            
        }
        console.log("Shareable link: ", shareableLink.current)
        setLinkLoading(false)
    }

    function saveVisibility(visibilityToSet: boolean)
    {
        setRankingInfo({...rankingInfo, isPublic: visibilityToSet})
        console.log("Changing visibility to: ", visibilityToSet)
        updateBasicRankingInfo(rankingInfo.description, rankingInfo.title, visibilityToSet)
    }

    function saveTitleAndDescription(desc: string, title: string)
    {
        console.log("Saving description: ", desc, " and title: ", title)
        setRankingInfo({...rankingInfo, description: desc, title: title})
        updateBasicRankingInfo(desc, title, rankingInfo.isPublic)
    }

    function handleBasicInfoSave(title: string, desc: string)
    {
        saveTitleAndDescription(desc, title)
        const dialog = document.getElementById("editRankDetailsModal") as HTMLDialogElement | null
        if(dialog)
        {
            dialog.close()
        }
    }

    function handleAddRankItemModal(){
        let addRankModal = document.getElementById("addRankModal") as HTMLDialogElement | null
        if(addRankModal)
        {
            addRankModal.showModal()
        }
    }

    function handleEditRankingDetails()
    {
        let editRankDetailsModal = document.getElementById("editRankDetailsModal") as HTMLDialogElement | null
        if(editRankDetailsModal)
        {
            editRankDetailsModal.showModal()
        }
    }

    return(
        <>
            <div className="mt-18 mb-8">
                
                <div className="flex flex-col gap-y-4">

                <div className="flex flex-col gap-y-5 items-center rounded-box p-2 transition duration-150 hover:cursor-pointer hover:bg-base-200/50 hover:outline-2 hover:outline-accent hover:outline-offset-4" onClick={handleEditRankingDetails}>
                    <header className="font-display font-semibold tracking-tight text-3xl lg:text-5xl self-center">{rankingInfo.title}
                        {updating ? <> <span className="inline-block"> <RefreshCw  size={30} className="animate-spin" /></span></> : null}
                    </header>  

                    <div className="flex flex-col gap-x-2 items-center">
                        <div className="font-medium text-lg text-base-content/75">{rankingInfo.description}</div>
                    </div>
                </div>
                    
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
                        <button className="tile-dashed group flex items-center justify-center gap-3 px-8 py-5" onClick={handleAddRankItemModal}>
                            <span className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors duration-200 group-hover:bg-primary group-hover:text-primary-content">
                                <Plus size={24}/>
                            </span>
                            <p className="font-display text-2xl lg:text-2xl font-medium">add rank item</p>
                        </button>
                        
                        <DragDropContext onDragEnd={handleDragEnd}>
                            <Droppable droppableId='viewRanking'>
                                {(provided) => (
                                    <div {...provided.droppableProps} 
                                        className="h-120 w-full flex flex-col rounded-box border border-dashed border-base-300 bg-base-200/40 p-4 gap-y-4 overflow-y-auto lg:gap-x-4"
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
            <ConfirmationModel dialogId={"changeVisibilityConfirmation"} modalTitle={`make ranking ${!rankingInfo.isPublic? "public" : "private"}`} modalMessage={`are you sure you want to make this ranking ${!rankingInfo.isPublic? "public" : "private"}`} onConfirm={() => {saveVisibility(!rankingInfo.isPublic)}} onReject={() => {}}/>
            <ConfirmationModel dialogId={"displayShareableId"} modalTitle={`shareable link available`} modalMessage={`copy this link to share this rank with others: ${shareableLink.current}`} onConfirm={() => {}} onReject={() => {}}/>
            <AddRankItemModal  dialogId={"addRankModal"} onClose={()=>{console.log("Modal closed")}} onSave={addNewRankItem} totalRanks={itemCount} />
            <EditRankDetailsModal dialogId={"editRankDetailsModal"} rankTitle={rankingInfo.title} rankDescription={rankingInfo.description} onSave={handleBasicInfoSave} onClose={()=>{console.log("Edit Rank Details Modal closed")}} />
        </>
    )
}

export default ViewRanking