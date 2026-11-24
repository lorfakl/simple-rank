function LoadingModal({dialogId, modalTitle, onLoadingComplete})
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
            <div className="modal-box rounded-box border border-base-300 shadow-lift">
                <h3 className="font-display font-semibold tracking-tight">{modalTitle}</h3>
                <p className="py-4">{modalMessage}</p>
                <div className="flex flex-row">
                    <div className="modal-action">
                        <form method="dialog">
                            {/* if there is a button in form, it will close the modal */}
                            <button className="btn btn-primary btn-lift" onClick={handleConfirmButtonClicked}>yes</button>
                            <button className="btn btn-ghost transition duration-150 hover:bg-base-200" onClick={handleRejectButtonClicked}>no</button>
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

export default LoadingModal