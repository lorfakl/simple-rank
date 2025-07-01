import React, { createContext, useContext, useEffect, useState } from 'react';
import { useSupabase } from './SupabaseContext';
import { useNotifications } from './NotificationContext';
import { authService } from '../api/services';


// Create context
const UserContext = createContext();

// Provider component
export function UserProvider({ children }) {

  const [user, setUser] = useState({})
  const [session, setSession] = useState(null)

  const [authenticated, setAuthenticated] = useState(false)

  const supabase = useSupabase()
  const { showNotification } = useNotifications()

  // Check if user is authenticated on mount
  useEffect(() => {
    const getSession = async () => {
      try
      {
        const {data, error} = await supabase.auth.getSession()
        if(error === null || error === undefined)
        {
            setUser(data.session.user)
            setSession(data.session)
            setAuthenticated(true)
        }

        const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
          console.log("Auth state changed: ", event, session);
          setSession(session)
        });
        
        return () => {
          subscription.unsubscribe();
        };

      }
      catch(error)
      {
        console.error(error)
      }
      
    }
    
    getSession()
  }, []);
  

  useEffect(() => {
    // Check if user is authenticated
    if (session) {

      setUser(session.user);
      setAuthenticated(true);
      localStorage.setItem('auth_token', session.access_token); // Store token
      localStorage.setItem('user', JSON.stringify(session.user)); // Store user data
      setUserMetadata(session.user)

    } else {
      setUser({});
      setAuthenticated(false);
      localStorage.removeItem('auth_token'); // Clear token if no session
      localStorage.removeItem('user'); // Clear user data
    }
  }, [session]);



  // Email sign in
  async function signInWithEmail(email, password) {
    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password
    })
    console.log(" user context: ", data, error)
    if(error != null)
    {
        //console.log("error on sign in with Email ", error)
        showNotification(`${error}`, "error", 10000)
        return {error: error, user: undefined}
        
    }
    else
    {
        //console.log("successfully signed in with Email, ", data)
        showNotification("Successfully logged in", "success", 1000)
        setSession(data.session)
        return {error: undefined, user: data.session.user} 
    }
  }

  // Email sign up
  async function signUpWithEmail(email, password, additionalData = {}) {
    console.log(supabase)
    const { data, error } = await supabase.auth.signUp({
        email: email,
        password: password
    })

    console.log(data, error)
    if(error)
    {
        console.log("error on sign in with Email ", error)
        showNotification(`${error}`, "error", 10000)
        return {error: error, user: undefined}
    }
    else
    {
        //console.log("successfully signed in with Email, ", data)
        showNotification("Successfully signed up, welcome", "success", 3000)
        setSession(data.session)
        return {error: undefined, user: data.user} 
    }
  }

  // Google sign in
  async function signInWithGoogle() {
    
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
            redirectTo: `${window.location.origin}/Home` // Redirect to the current origin after sign in
        }
    })

    if(error)
    {
        //console.log("error on sign in with Email ", error)
        showNotification(`${error}`, "error", 10000)
        return {error: error, user: undefined}
        
    }
    else
    {
        //console.log("successfully signed in with Email, ", data)
        showNotification("Successfully signed in", "success", 3000)
        setSession(data.session)
        console.log("user context: ", data)
        return {error: undefined, user: data.session.user} 
    }
  }

  // Discord OAuth sign in
  async function signInWithDiscord() {
    
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord', 
        options: {
            redirectTo: `${window.location.origin}/Home` // Redirect to the current origin after sign in
        }
    })
    
    if(error)
    {
        //console.log("error on sign in with Email ", error)
        showNotification(`${error}`, "error", 10000)
        return {error: error, user: undefined}
        
    }
    else
    {
        //console.log("successfully signed in with Email, ", data)
        showNotification("Successfully signed in", "success", 3000)
        setSession(data.session)
        return {error: undefined, user: data.session.user} 
    }
  }

  async function setUserMetadata(user){
    let request = {
      id: user.id,
      name: user.user_metadata.full_name,
      avatarUrl: user.user_metadata.avatar_url,
    }

    try{
      let response = await authService.setMetadata(request)
      if(response.error)
      {

      }
      else
      {

      }
    }
    catch(error)
    {

    }
  }


  // Sign out
  async function signOut() {
    const { error } = await supabase.auth.signOut()
    setUser({})
    setSession(null)
    if(error)
    {
        showNotification(`${error}`, "error", 10000)
    }
  }

  // Get current user information
  function getCurrentUser() {
    return user;
  }


  const value = {
    // State
    user: user,
    session: session,
    isAuthenticated: authenticated,

    // Auth functions
    signInWithEmail,
    signUpWithEmail,
    signInWithGoogle,
    signInWithDiscord,
    signOut,

    // User functions
    getCurrentUser
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// Custom hook to use the context
export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth(Component) {
  return function AuthenticatedComponent(props) {
    const { isAuthenticated, isLoading } = useUser();

    if (isLoading) {
      return <div>Loading...</div>; // Replace with your loading component
    }

    if (!isAuthenticated) {
      return <div>Please sign in to access this page.</div>; // Replace with redirect to login
    }

    return <Component {...props} />;
  };
}