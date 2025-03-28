function Rankings({title, description, rankItems})
{
    return(
        <>
            <div className="rounded-lg h-1/4 w-full flex flex-col hover:shadow-xl bg-base-100 border-4 border-red-500 lg:aspect-square"> 
                <div>{title}</div>
                <p>{description}</p>
                <div>Item Count: {rankItems.length}</div>
            </div>
        </>
    )
}

export default Rankings