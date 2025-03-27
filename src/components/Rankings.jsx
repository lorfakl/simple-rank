function Rankings({title, description, rankItems})
{
    return(
        <>
            <div className="rounded-lg hover:shadow-xl"> 
                <div>{title}</div>
                <p>{description}</p>
                <div>Item Count: {rankItems.length}</div>
            </div>
        </>
    )
}

export default Rankings