import { useRef, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import { useUser } from '../contexts/UserContext';
import { IconSwap } from './IconSwap';
import { Menu, X } from 'lucide-react';
function Navbar()
{
    const { session, signOut } = useUser()
    const  navigate  = useNavigate()

    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [avatarUrl, setAvatarUrl] = useState("")
    const [fullName, setFullName] = useState("")
    const [navbarStatus, setNavbarStatus] = useState(false)

    const dropdownRef = useRef(null)

    useEffect(() => {
        function handleClickOutsideDropdown(event) {
            console.log("detected a click outside the dropdown element ", event.target)
            if(dropdownRef && !dropdownRef.current.contains(event.target))
            {
                console.log("valid click outside of dropdown")
                setNavbarStatus(false)
            }
        }

        console.log(session)
        if(session)
        {
            console.log("User is authenticated:", session);
            loadAvatarUrl()
            loadFullName()
            
        }
        
        document.addEventListener('mousedown', handleClickOutsideDropdown);

        return () => { document.removeEventListener('mousedown', handleClickOutsideDropdown) }   

    }, [])
    
    useEffect(()=>{
        if(session === null || session === undefined || Object.keys(session).length === 0)
        {
            console.log("User is not authenticated")
            console.log(session)
            setIsAuthenticated(false)
            localStorage.removeItem('avatarUrl')
            localStorage.removeItem('fullName')
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
                setAvatarUrl(`https://ui-avatars.com/api/?name=${fullName}&background=random&rounded=true`) // Default avatar image
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
    const closeAndNavigate = (path) => {
    // First, close the navbar
    setNavbarStatus(false);
    
    // 3. Wait a brief moment for the animation/re-render, then navigate
    setTimeout(() => {
        navigate(path);
    }, 200); // 200ms is usually enough for a smooth transition
};

    const closeNavbar = () => {
        setNavbarStatus(false)
        console.log("Link on clicked called -> Navbar closed")
    }

    const toggleNavbar = (active) => {
        console.log("toggleNavbar called with value: ", active)

        if(active)
        {
            console.log("closed", navbarStatus)
            setNavbarStatus(active)
        }
        else
        {
            console.log("opened", navbarStatus)
            setNavbarStatus(active)
        }
        
    }
    
    return(
    <>
        <div className="navbar bg-base-100 fixed left-0 top-0 z-10 min-w-screen">
            <div className="navbar-start lg:hidden" >
                <div className={`dropdown ${navbarStatus ? 'dropdown-open' : ''}`} ref={dropdownRef}>
                    <IconSwap onIcon={<X size={32} />} offIcon={<Menu size={32} />} onSwapCallback={toggleNavbar} defaultOn={navbarStatus} parentControlSwap={true}/>
    
                    <ul className="menu menu-sm dropdown-content bg-base-100 rounded-box mt-3 w-52 p-2 shadow">
                        { isAuthenticated ? 
                        <>
                            <li ><a onClick={() => closeAndNavigate('/Home')}>my rankings</a></li>
                            <li ><a onClick={() => closeAndNavigate('/NewRank')}>create new rank</a></li>
                            {/* <li><Link to="Explore">explore</Link></li>
                            <li><Link to="About">about</Link></li>*/}
                        </>
                        : 
                        <>
                            <li><Link to="SignUp">sign in</Link></li>
                        </>
                        }
                    </ul>
                </div>
            </div>
            {/*Large format navbar*/}
            <div className="navbar-start hidden lg:flex flex-row gap-4">
                { isAuthenticated ? 
                <>
                    <Link to="Home">my rankings</Link>
                    <Link to="NewRank">create new rank</Link>
                    {/* <Link to="xplore">explore</Link>
                    <Link to="About">about</Link>*/}
                </>
                : 
                <>
                    <Link to="SignUp">sign in</Link>
                </>
                }

            </div>
            <div className="navbar-center mx-auto">
                <a className="btn btn-ghost text-xl" onClick={() => {navigate("/")}}>simple rank</a>
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
                                <li onClick={handleLogout}><Link to="Login">sign out</Link></li>
                            </ul>
                        </>
                        :
                        <>
                            <button className="btn btn-active btn-primary" onClick={() => {navigate("/Login")}}>sign in</button>
                        </>
                    }
                    
                </div>
            </div>
        </div>
    </>
    )
}

export default Navbar