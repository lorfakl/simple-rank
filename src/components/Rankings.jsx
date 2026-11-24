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
        console.log("Navigating to ranking details for ID: ", id)
        navigate(`/ranking/${id}`)
    }

    
    // presentation-only: top 3 items by rank for the card's name chips
    const topItems = (Array.isArray(rankItems) ? [...rankItems] : [])
        .filter(item => String(item?.name ?? item?.Name ?? item?.title ?? "").trim() !== "")
        .sort((a, b) => Number(a?.rank ?? a?.Rank ?? 0) - Number(b?.rank ?? b?.Rank ?? 0))
        .slice(0, 3)
        .map((item, chipIndex) => ({
            label: String(item?.name ?? item?.Name ?? item?.title ?? "").trim(),
            position: item?.rank ?? item?.Rank ?? chipIndex + 1
        }))

    return(
        <>
            <div className={`card-tile ${data.isPinned ? "card-pinned" : ""} flex flex-col gap-3 rounded-box p-5 cursor-pointer`}>
                <div className="card-heading font-display text-xl font-semibold tracking-tight break-words" onClick={() => {navigateToRankingDetails()}}>{title}</div>
                <div className="flex min-w-0 flex-wrap items-center gap-2 px-2" onClick={() => {navigateToRankingDetails()}}>
                    <span className="rank-chip text-xs">rank items: {rankItems.length}</span>
                    {topItems.map((item, chipIndex) => (
                        <span key={chipIndex} className="top-chip" title={item.label}>
                            <span className="top-chip-pos">{item.position}</span>
                            <span className="top-chip-name">{item.label}</span>
                        </span>
                    ))}
                </div>
                <p className="font-medium text-base-content/75 break-words" onClick={() => {navigateToRankingDetails()}}>{description}</p>
                <div className="px-2 text-sm text-base-content/70" onClick={() => {navigateToRankingDetails()}}>
                    <div>creator: {data.createdBy.displayName}</div>
                </div>
                <div className="flex flex-row items-center justify-between px-2" onClick={() => {navigateToRankingDetails()}}>
                    <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar p-0">
                        <div className="w-12 rounded-full ring-1 ring-base-300">
                        <img
                            alt="ranking creator profile image"
                            src={data.createdBy.avatarUrl}/>
                        </div>
                    </div>
                    <div className="flex flex-col items-center">
                        {data.isPublic ? <><Earth size={24} strokeWidth={1.75} className="text-base-content/70" /></>: <><Lock size={24} strokeWidth={1.75} className="text-base-content/70" /></> }
                        <p className="pr-2 text-sm text-base-content/70">{data.isPublic ? "public": "private"}</p>
                    </div>
                </div>
                <div className="self-start px-2 text-sm text-base-content/60" onClick={() => {navigateToRankingDetails()}}>last updated: {dateTimeHelper.convertStringToLocalTime(data.lastUpdated)}</div>
                <div className="self-start px-2 text-sm text-base-content/60" onClick={() => {navigateToRankingDetails()}}>created: {dateTimeHelper.convertStringToLocalTime(data.createdDate)}</div>
                <div className="mt-auto flex flex-row items-center justify-around border-t border-base-200 pt-3">
                    <div className="flex flex-col items-center">
                        <IconSwap onIcon={<Pin size={28} className="text-accent" />} offIcon={<PinOff size={28} className="text-base-content/45" />} onSwapCallback={handlePinnedRanking} defaultOn={data.isPinned}/>
                        {data.isPinned ? <p className="text-xs text-accent">click to unpin</p> : <p className="text-xs text-base-content/50">click to pin</p>}
                    </div>

                    <div onClick={() => {onDelete(id, title)}} className="flex cursor-pointer flex-col items-center rounded-lg p-2 transition-colors duration-150 hover:bg-error/10">
                        <Trash2 size={28} className="text-error"/>
                    </div>
                </div>
            </div>
            
        </>
    )
}

export default Rankings