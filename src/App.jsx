import './App.css'
import { useState, useEffect } from 'react'

import { BrowserRouter, Routes, Route, Router } from 'react-router-dom'
import { createClient } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import Home from './pages/Home'
import Signup from './pages/Signup'
import LandingPage from './pages/LandingPage'
import Navbar from './components/Navbar'
import CreateRank from './pages/CreateRank'
import ViewRanking from './pages/ViewRanking'
import { SupabaseProvider } from './contexts/SupabaseContext'



function App() {
  return (
    <>
      <SupabaseProvider>
        <BrowserRouter>
            <Navbar/>
            <Routes>
              <Route path="/" element={<LandingPage/>}/>
              <Route path="/Home" element={<Home/>}/>
              <Route path="/SignUp" element={<Signup/>}/>
              <Route path="/NewRank" element={<CreateRank/>}/>
              <Route path="/ranking/:id" element={<ViewRanking/>}/>
              <Route path="/Explore"/>
            </Routes>
          </BrowserRouter>
      </SupabaseProvider>
    </>
  )
}

export default App
