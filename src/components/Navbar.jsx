import { use, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUser } from '../contexts/UserContext';
function Navbar()
{
    const { session, signOut } = useUser()
    const  navigate  = useNavigate()

    const [isAuthenticated, setIsAuthenticated] = useState(false)

    useEffect(() => {
        console.log(session)
        if(session)
        {
            console.log("User is authenticated:", session);
            
        } 
    }, [])
    
    useEffect(()=>{
        if(session === null || session === undefined || Object.keys(session).length === 0)
        {
            console.log("User is not authenticated")
            console.log(session)
            setIsAuthenticated(false)
        }
        else
        {
            setIsAuthenticated(true)
        }
    },[session])
    

    const handleLogout = () => {
        console.log("Logout was clicked")
        navigate("/Login")
        signOut()
    }

    return(
    <>
        <div className="navbar bg-base-100 fixed left-0 top-0 z-10 min-w-screen px-8">
            <div className="navbar-start flex-none lg:hidden">
                <div className="dropdown">
                <div tabIndex={0} role="button" className="btn btn-ghost btn-circle">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor"> <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" /> </svg>
                </div>
                <ul
                    tabIndex={0}
                    className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 w-52 p-2 shadow">
                    <li><Link to="Home">My Rankings</Link></li>
                    <li><Link to="NewRank">Create New Rank</Link></li>
                    <li><Link to="Explore">Explore</Link></li>
                    <li><Link to="About">About</Link></li>
                </ul>
                </div>
            </div>
            {/*Large format navbar*/}
            <div className="navbar-start hidden lg:flex flex-row gap-4">
                <Link to="Home">My Rankings</Link>
                <Link to="NewRank">Create New Rank</Link>
                <Link to="Explore">Explore</Link>
                <Link to="About">About</Link>
            </div>
            <div className="navbar-center mx-auto">
                <a className="btn btn-ghost text-xl">simple rank</a>
            </div>
            <div className="navbar-end">
                <div className="dropdown dropdown-end">
                    {
                        isAuthenticated? 
                        <>
                            <div tabIndex={0} role="button" className="btn btn-ghost btn-circle avatar">
                                <div className="w-16 rounded-full">
                                <img
                                    alt="Tailwind CSS Navbar component"
                                    src="https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp" />
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow">
                                <li><Link to="Profile">Profile</Link></li>
                                <li onClick={handleLogout}><Link to="Login">Logout</Link></li>
                            </ul>
                        </>
                        :
                        <>
                            <button className="btn btn-active btn-primary" onClick={() => {navigate("/Login")}}>Login</button>
                        </>
                    }
                    
                </div>
            </div>
        </div>
    </>
    )
}

export default Navbar