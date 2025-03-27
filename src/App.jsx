import './App.css'
import { useState } from 'react'
import Home from './pages/Home'
import { BrowserRouter, Routes, Route, Router } from 'react-router-dom'
import Navbar from './components/Navbar'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <BrowserRouter>
        <Navbar/>
        <Routes>
          <Route path="/" element={<Home/>}/>
          <Route path="/CreateRanking"/>
          <Route path="/ViewRanking"/>
          <Route path="/Explore"/>
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
