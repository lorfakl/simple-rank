import { useNavigate } from 'react-router';
import { dateTimeHelper } from '../helper/helper';
import { ChevronDown,Trash2, PinOff, Pin, Earth, Lock } from 'lucide-react';
import { IconSwap } from './IconSwap';
import { useEffect, useState } from 'react';
import { rankingService } from '../api/services';
import { useNotifications } from '../contexts/NotificationContext';

function Rankings({id, title, data, description, rankItems, onPinned, onDelete})
{

    // useEffect(()=>{
        
    // },[pinned])
     const navigate = useNavigate()
    const { showNotification } = useNotifications()

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

    async function pinRanking(pinOperation)
    {
        console.log(` Setting IsPinned value of ranking: ${id} to: ${pinOperation}`)
        const request = {
            rankingId: id, 
            pinOperation: pinOperation
        }

        try
        {
            const response = await rankingService.setRankingPin(request)
            if(response.error)
            {
                console.error("Error pinning ranking: ", response.error)
                showNotification("Error pinning ranking", "error", 3000)
                return
            }
            else
            {
                console.log("Successfully pinned ranking: ", response.data)
                showNotification(`Ranking has been ${pinOperation ? "pinned":"unpinned"}`, "success", 750)
                onPinned(id, pinOperation)
            }
        }
        catch(error)
        {
            console.error("Error pinning ranking: ", error)
            showNotification("Error pinning ranking", "error", 3000)
            return
        }
        
    }

    function handlePinnedRanking(pinned)
    {
        console.log(`Ranking has been ${!pinned ? "pinned":"unpinned"}`)
        if(pinned)
        {
            pinRanking(true)
        }
        else
        {
            pinRanking(false)
        }
    }

    function navigateToRankingDetails()
    {
        navigate(`/ranking/${id}`)
    }

    
    return(
        <>
            <div className="rounded-lg flex flex-col gap-4 hover:shadow-xl cursor-pointer bg-base-300 border-4  lg:aspect-square"> 
                <div className="font-bold text-xl" onClick={() => {navigateToRankingDetails}}>{title}</div>
                <p className="font-semibold" onClick={() => {navigateToRankingDetails}}>{description}</p>
                <div className="flex flex-row justify-between px-2" onClick={() => {navigateToRankingDetails}}>
                    <div>rank items: {rankItems.length}</div>
                    <div>creator: {data.createdBy.displayName}</div>
                </div>
                <div className="flex flex-row justify-between px-2" onClick={() => {navigateToRankingDetails}}>
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                        <div className="w-16 rounded-full">
                        <img
                            alt="ranking creator profile image"
                            src={data.createdBy.avatarUrl}/>
                        </div>
                    </div>
                    <div className="justify-items-center">
                        {data.isPublic ? <><Earth size={32} strokeWidth={1.75} /></>: <><Lock size={32} strokeWidth={1.75} /></> }
                        <p className="pr-2">{data.isPublic ? "public": "private"}</p>
                    </div>
                </div>
                <div className="self-start px-2" onClick={() => {navigateToRankingDetails}}>last updated: {dateTimeHelper.convertStringToLocalTime(data.lastUpdated)}</div>
                <div className="self-start px-2" onClick={() => {navigateToRankingDetails}}>created: {dateTimeHelper.convertStringToLocalTime(data.createdDate)}</div>
                <div className="flex flex-row justify-around">
                    <div>
                        <IconSwap onIcon={<Pin size={36} />} offIcon={<PinOff size={36} />} onSwapCallback={handlePinnedRanking} defaultOn={data.isPinned}/>
                        {data.isPinned ? <p className="text-sm">click to unpin</p> : <p className="text-sm">click to pin</p>}
                    </div>

                    <div onClick={() => {onDelete(id, title)}} className="flex flex-col items-center">
                        <Trash2 size={36} className="text-error"/>
                    </div>
                </div>
            </div>
            
        </>
    )
}

export default Rankings