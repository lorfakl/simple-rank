import {createContext, useContext, useState} from 'react'
import {ToastContainer, toast, Zoom} from 'react-toastify'
const NotificationContext = createContext();


export const NotificationProvider = ({children}) => {

    const showNotification = (message, type, delay) => {
      console.log("Delay: ", delay === undefined)
      if(type === "info") {
          toast.info(message, {
            position: "top-right",
            autoClose: delay === undefined ? 5000 : delay,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            transition: Zoom,
           });
      } else if (type === "warning") {
          toast.warning(message, {
            position: "top-right",
            autoClose: delay === undefined ? 5000 : delay,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            transition: Zoom,
           });
      } else if (type === "error") {
           toast.error(message, {
            position: "top-right",
            autoClose: delay === undefined ? 5000 : delay,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            transition: Zoom,
           });
      } else if (type === "success") {
          toast.success(message, {
            position: "top-right",
            autoClose: delay === undefined ? 2000 : delay,
            hideProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            transition: Zoom,
           });
      } 
    }

    const hideNotifications = () => {
        toast.dismiss()
    }

    return (
        <NotificationContext.Provider value={{showNotification, hideNotifications}}>
            <ToastContainer/>
            {children}
        </NotificationContext.Provider>
    )
}

export const useNotifications = () => {
    return useContext(NotificationContext)
}

