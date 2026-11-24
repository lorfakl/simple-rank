function ConfirmationModel({dialogId, modalTitle, modalMessage, onConfirm, onReject, autoClose = false})
{

    function handleRejectButtonClicked()
    {
        console.log("No was clicked")
        onReject()
        if(autoClose)
        {
            handleCloseModal()
        }
    }

    function handleConfirmButtonClicked()
    {
        console.log("Yes was clicked")
        onConfirm()
        if(autoClose)
        {
            handleCloseModal()
        }
    }

    function handleCloseModal()
    {
        console.log("Close was clicked")
        const modal = document.getElementById(dialogId);
        if(modal)
        {
            modal.close()
        }
    }

    return(<>
        <dialog id={`${dialogId}`} className="modal modal-bottom sm:modal-middle">
            {/* explicit max-width + side margins so it never exceeds the viewport on phones */}
            <div className="modal-box w-[calc(100%-2rem)] max-w-[32rem] rounded-box border border-base-300 shadow-lift">
                <h3 className="font-display font-semibold tracking-tight">{modalTitle}</h3>
                <p className="py-4 text-base-content/75">{modalMessage}</p>
                <div className="flex flex-row">
                <div className="w-full">
                        <form method="dialog">
                            <div className="flex flex-row justify-between w-full gap-3">
                                <button className="btn btn-primary btn-lift" onClick={handleConfirmButtonClicked}>yes</button>
                                <button className="btn btn-ghost transition duration-150 hover:bg-base-200" onClick={handleRejectButtonClicked}>no</button>
                            </div>
                            {/* if there is a button in form, it will close the modal */}
                        </form>
                    </div>
					
                </div>
            </div>
            <form method="dialog" className="modal-backdrop">
                <button>close</button>
            </form>
        </dialog>
    </>)
}

export default ConfirmationModel