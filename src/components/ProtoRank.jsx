function ProtoRank({rankingNumber, onTitleChange, onDescriptionChange}){


    return(
        <>
            <div className="my-18 flex flex-col gap-y-8 w-full">
                <label className="floating-label">
                    <input type="text" placeholder="enter name" className="input input-lg" />
                    <span>item name</span>
                </label>

                <label className="floating-label">
                    <input type="text" placeholder="enter description" className="input input-lg" />
                    <span>item description</span>
                </label>

            </div>
        </>
    )
}

export default ProtoRank