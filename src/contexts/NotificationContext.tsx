import {createContext, useContext, useState} from 'react'
import type { ReactNode } from 'react'
import {ToastContainer, toast, Zoom} from 'react-toastify'

export type NotificationType = "info" | "warning" | "error" | "success"

export interface NotificationContextValue {
    showNotification: (message: string, type: NotificationType, delay?: number) => void
    hideNotifications: () => void
}

const NotificationContext = createContext<NotificationContextValue | undefined>(undefined)


export const NotificationProvider = ({children}: { children?: ReactNode }) => {

    const showNotification = (message: string, type: NotificationType, delay?: number) => {
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
    // Provider is always mounted by App; the assertion is erased at runtime so
    // destructuring still throws exactly as before when used outside it.
    return useContext(NotificationContext)!
}

