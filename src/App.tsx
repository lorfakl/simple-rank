import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home'
import Signup from './pages/Signup'
import LandingPage from './pages/LandingPage'
import Navbar from './components/Navbar'
import CreateRank from './pages/CreateRank'
import ViewRanking from './pages/ViewRanking'
import SharedRank from './pages/SharedRank'
import { SupabaseProvider } from './contexts/SupabaseContext'
import { UserProvider } from './contexts/UserContext'
import Login from './pages/Login'
import { NotificationProvider } from './contexts/NotificationContext'
import type { ComponentType } from 'react'



function App() {
  return (
    <>
      <NotificationProvider>
        <SupabaseProvider>
          <UserProvider>
            <BrowserRouter>
              <Navbar/>
              <Routes>
                <Route path="/" element={<LandingPage/>}/>
                <Route path="/Home" element={<Home/>}/>
                <Route path="/SignUp" element={<Signup/>}/>
                <Route path="/Login" element={<Login/>}/>
                <Route path="/NewRank" element={<CreateRank/>}/>
                <Route path="/ranking/:id" element={<ViewRanking/>}/>
                <Route path="/share/:id" element={<SharedRank/>}/>
                <Route path="/Explore"/>
              </Routes>
            </BrowserRouter>
          </UserProvider>
        </SupabaseProvider>
      </NotificationProvider>
    </>
  )
}

// main.tsx renders <App className=.../>; App accepts and ignores the prop —
// typing it here keeps the emitted code identical.
export default App as ComponentType<{ className?: string }>
