function ConfirmationModel({dialogId, modalTitle, modalMessage, onConfirm, onReject})
{

    function handleRejectButtonClicked()
    {
        console.log("No was clicked")
        onReject()
    }

    function handleConfirmButtonClicked()
    {
        console.log("Yes was clicked")
        onConfirm()
    }

    return(<>
        <dialog id={`${dialogId}`} className="modal modal-bottom sm:modal-middle">
            <div className="modal-box">
                <h3 className="font-bold text-lg">{modalTitle}</h3>
                <p className="py-4">{modalMessage}</p>
                <div className="flex flex-row">
                <div className="w-full">
                        <form method="dialog">
                            <div className="flex flex-row justify-between w-full">
                                <button className="btn" onClick={handleConfirmButtonClicked}>Yes</button>
                                <button className="btn" onClick={handleRejectButtonClicked}>No</button>
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