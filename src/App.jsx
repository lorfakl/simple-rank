import './App.css'
import { useState } from 'react'
import Home from './pages/Home'
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom'
import Navbar from './components/Navbar'
import CreateRank from './pages/CreateRank'
function App() {


  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/Home" element={<Home/>}/>
          <Route path="/NewRank" element={<CreateRank/>}/>
          <Route path="/ViewRanking"/>
          <Route path="/Explore"/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
