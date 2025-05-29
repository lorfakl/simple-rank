import React, { createContext, useContext, useReducer, useEffect, useState } from 'react';
import { useSupabase } from './SupabaseContext';
import { useNotifications } from './NotificationContext';
// Example: Import other contexts you want to use
// import { useTheme } from './ThemeContext';
// import { useNotification } from './NotificationContext';
// import { useSettings } from './SettingsContext';

// Authentication API endpoints - replace with your actual API URLs
const API_ENDPOINTS = {
  EMAIL_SIGNIN: '/api/auth/email/signin',
  EMAIL_SIGNUP: '/api/auth/email/signup',
  GOOGLE_SIGNIN: '/api/auth/google',
  OAUTH_SIGNIN: '/api/auth/oauth', // Generic OAuth endpoint
  GET_USER: '/api/auth/user',
  LOGOUT: '/api/auth/logout',
  REFRESH_TOKEN: '/api/auth/refresh'
};

// Auth states
const AUTH_ACTIONS = {
  SIGN_IN_START: 'SIGN_IN_START',
  SIGN_IN_SUCCESS: 'SIGN_IN_SUCCESS',
  SIGN_IN_ERROR: 'SIGN_IN_ERROR',
  SIGN_OUT: 'SIGN_OUT',
  SET_USER: 'SET_USER',
  SET_LOADING: 'SET_LOADING'
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,
  token: localStorage.getItem('auth_token')
};

// Reducer
function authReducer(state, action) {
  switch (action.type) {
    case AUTH_ACTIONS.SIGN_IN_START:
      return {
        ...state,
        isLoading: true,
        error: null
      };
    case AUTH_ACTIONS.SIGN_IN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.SIGN_IN_ERROR:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload
      };
    case AUTH_ACTIONS.SIGN_OUT:
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        error: null
      };
    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload,
        isAuthenticated: !!action.payload,
        isLoading: false
      };
    case AUTH_ACTIONS.SET_LOADING:
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
}

// Create context
const UserContext = createContext();


// Provider component
export function UserProvider({ children }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const [user, setUser] = useState({})
  const [session, setSession] = useState(null)

  const [authenticated, setAuthenticated] = useState(false)

  const supabase = useSupabase()
  const { showNotification } = useNotifications()

  // Example: Using other contexts within UserContext
  // const { setTheme } = useTheme();
  // const { showNotification } = useNotification();
  // const { getUserSettings, updateSettings } = useSettings();

  // Check if user is authenticated on mount
  useEffect(() => {
    const getSession = async () => {
      try
      {
        const {data, error} = await supabase.auth.getSession()
        if(error === null || error === undefined)
        {
            setUser(data.session.user)
        }
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
    } else {
      setUser({});
      setAuthenticated(false);
      localStorage.removeItem('auth_token'); // Clear token if no session
      localStorage.removeItem('user'); // Clear user data
    }
  }, [session]);

  async function updateUserMetadata(metadata) {
    const { data, error } = await supabase.auth.updateUser({
      data: metadata
    })

    if(error)
    {
        console.error("Error updating user metadata: ", error)
        showNotification(`${error}`, "error", 10000)
        return {error: error, user: undefined}
    }
    else
    {
        console.log("User metadata updated successfully: ", data)
        setUser(data.user)
        showNotification("User metadata updated successfully", "success", 3000)
        return {error: undefined, user: data.user} 
    }
  }


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
        showNotification("Successfully logged in", "success", 3000)
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
        provider: 'google'
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
        setUser(data.session.user)
        return {error: undefined, user: data.session.user} 
    }
  }

  // Generic OAuth sign in
  async function signInWithDiscord() {
    
    const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'discord'
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
        setUser(data.session.user)
        return {error: undefined, user: data.session.user} 
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
    isLoading: state.isLoading,
    error: state.error,

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