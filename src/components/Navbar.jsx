import { use, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUser } from '../contexts/UserContext';
function Navbar()
{
    const { session, signOut } = useUser()
    const  navigate  = useNavigate()

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState("")
    const [fullName, setFullName] = useState("")

    useEffect(() => {
        console.log(session)
        if(session)
        {
            console.log("User is authenticated:", session);
            loadAvatarUrl()
            loadFullName()
            
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
            loadAvatarUrl()
            loadFullName()
        }
    },[session])
    

    const handleLogout = () => {
        console.log("Logout was clicked")
        navigate("/Login")
        signOut()
    }

    function loadAvatarUrl()
    {
        const avatarImagePath = localStorage.getItem('avatarUrl'); //get avatar image path

        if(avatarImagePath === null || avatarImagePath === undefined || avatarImagePath === ""){
            const userData = localStorage.getItem('user'); //get user data
            if(userData)
            {
                const user = JSON.parse(userData);
                console.log(user.user_metadata.avatar_url, " User avatar URL");
                setAvatarUrl(user.user_metadata.avatar_url)
                setFullName(user.user_metadata.full_name)
                localStorage.setItem('avatarUrl', user.user_metadata.avatar_url); // Store avatar URL in localStorage
            }
            else
            {
                console.log("No user data found in localStorage")
                setAvatarUrl("https://img.daisyui.com/images/stock/photo-1534528741775-53994a69daeb.webp") // Default avatar image
            }
        }
        else
        {
            console.log(avatarImagePath, " Avatar image path");
            setAvatarUrl(avatarImagePath)
        }
    }

    function loadFullName()
    {
        // Load full name from localStorage
        const fullNameFromStorage = localStorage.getItem('fullName'); //get full name from localStorage

        if(fullNameFromStorage === null || fullNameFromStorage === undefined || fullNameFromStorage === "")
        {
            const userData = localStorage.getItem('user'); //get user data
            if(userData)
            {
                const user = JSON.parse(userData);
                console.log(user.user_metadata.full_name, " User full name");
                setFullName(user.user_metadata.full_name)
            }
            else
            {
                console.log("No user data found in localStorage")
            }
        }
        else
        {
            console.log(fullNameFromStorage, " Full name from localStorage");
            setFullName(fullNameFromStorage)
        }
        
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
                                    src={avatarUrl}/>
                                </div>
                            </div>
                            <ul tabIndex={0} className="menu menu-sm dropdown-content bg-base-100 rounded-box z-1 mt-3 p-2 shadow">
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