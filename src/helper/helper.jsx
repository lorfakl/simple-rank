export const dateTimeHelper ={
    convertStringToLocalTime: (dateString) => {
        let utcDate = new Date()
        if(dateString.includes("Z"))
        {
            utcDate = new Date(dateString)
        }
        else
        {
            utcDate = new Date(dateString + "Z");
        }
        

        // Convert to specific timezone
        const localDate = utcDate.toLocaleString("en-US", {
        timeZone: Intl.DateTimeFormat().resolvedOptions().timeZone, // Client's timezone
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
        });

        return localDate
    }
}