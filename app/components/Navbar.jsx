import React, {useEffect, useRef, useState} from 'react'
import { FaMoon, FaSun } from 'react-icons/fa';
import { MdOutlineMenu } from "react-icons/md";
import { IoIosClose } from "react-icons/io";
import { BsStars } from "react-icons/bs";
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();
    const [isScroll, setIsScroll] = useState(false);
    const sideMenuRef = useRef();
    const openMenu = () => {
        sideMenuRef.current.style.transform = 'translateX(-16rem)';
    }
    const closeMenu = () => {
        sideMenuRef.current.style.transform = 'translateX(16rem)';
    }

    useEffect(() => {
        window.addEventListener('scroll', () => {
            if(scrollY > 50) {
                setIsScroll(true);
            } else {
                setIsScroll(false);
            }
        })
    }, [])

  return (
    <>
        <nav 
            className={`w-full fixed top-0 left-0 px-5 lg:px-8 xl:px-[8%] py-4 flex items-center justify-between z-50 transition-all duration-300 backdrop-blur-md ${isScroll ? "shadow-sm" : ""}`} 
            style={{
                backgroundColor: isScroll 
                    ? 'var(--bg-primary)' 
                    : theme === 'light' 
                        ? 'rgba(255, 255, 255, 0.85)' 
                        : 'rgba(15, 23, 42, 0.85)'
            }}
        >
            <a href="#top" className="text-2xl font-Ovo font-bold" style={{color: 'var(--text-primary)'}}>
                <BsStars />
            </a>
            <ul className={`hidden md:flex items-center gap-15 lg:gap-8 rounded-full px-25 py-3 transition-all duration-300 ${isScroll ? "shadow-sm" : "shadow-sm"}`} style={{backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-primary)'}}>
                <li><a className='font-Ovo transition-colors duration-200 hover:opacity-70' style={{color: 'var(--text-primary)'}} href="#home">Home</a></li>
                <li><a className='font-Ovo transition-colors duration-200 hover:opacity-70' style={{color: 'var(--text-primary)'}} href="#about">About</a></li>
                <li><a className='font-Ovo transition-colors duration-200 hover:opacity-70' style={{color: 'var(--text-primary)'}} href="#projects">Projects</a></li>
                <li><a className='font-Ovo transition-colors duration-200 hover:opacity-70' style={{color: 'var(--text-primary)'}} href="#contact">Contact</a></li>
            </ul>
            <div className='flex items-center gap-4'>
                <button 
                    onClick={toggleTheme}
                    className="p-2 rounded-full transition-all duration-200 hover:bg-opacity-10 hover:bg-gray-500"
                    style={{color: 'var(--text-primary)'}}
                    aria-label="Toggle theme"
                >
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                </button>
                <a href="#contact" className='hidden lg:flex items-center gap-3 px-10 py-2.5 border rounded-full ml-4 transition-all duration-200 hover:opacity-70' style={{borderColor: 'var(--border-primary)', color: 'var(--text-primary)'}}>Contact</a>
                <button className='block md:hidden ml-3' onClick={openMenu} style={{color: 'var(--text-primary)'}}>
                    <MdOutlineMenu className='h-7 w-7' />
                </button>
            </div>

            <ul ref={sideMenuRef} className='flex md:hidden flex-col gap-4 py-20 px-10 fixed -right-64 top-0 bottom-0 w-64 z-50 h-screen transition duration-500' style={{backgroundColor: 'var(--bg-primary)'}}>
                <div className='absolute right-6 top-6' onClick={closeMenu}>
                    <IoIosClose className='h-10 w-10 cursor-pointer' style={{color: 'var(--text-primary)'}} />
                </div>
                <li><a onClick={closeMenu} href="#home" className="font-Ovo transition-colors duration-200 hover:opacity-70" style={{color: 'var(--text-primary)'}}>Home</a></li>
                <li><a onClick={closeMenu} href="#about" className="font-Ovo transition-colors duration-200 hover:opacity-70" style={{color: 'var(--text-primary)'}}>About</a></li>
                <li><a onClick={closeMenu} href="#projects" className="font-Ovo transition-colors duration-200 hover:opacity-70" style={{color: 'var(--text-primary)'}}>Projects</a></li>
                <li><a onClick={closeMenu} href="#contact" className="font-Ovo transition-colors duration-200 hover:opacity-70" style={{color: 'var(--text-primary)'}}>Contact</a></li>
            </ul>
        </nav>
    </>
  )
}

export default Navbar