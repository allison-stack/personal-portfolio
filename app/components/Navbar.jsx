import React, {useEffect, useRef, useState} from 'react'
import { FaMoon } from 'react-icons/fa';
import { MdOutlineMenu } from "react-icons/md";
import { IoIosClose } from "react-icons/io";

const Navbar = () => {

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
        <nav className={`w-full fixed px-5 lg:px-8 xl:px-[8%] py-4 flex items-center justify-between z-50 ${isScroll ? "bg-white backdrop-blur-lg shadow-sm bg-opacity-50" : ""}`}>
            <a href="#top">

            </a>
            <ul className={`hidden md:flex items-center gap-10 lg:gap-8 rounded-full px-12 py-3 ${isScroll ? "" : "bg-white shadow-sm bg-opacity-50"} bg-white shadow-sm bg-opacity-50`}>
                <li><a href="#home">Home</a></li>
                <li><a href="#about">About</a></li>
                <li><a href="#projects">Projects</a></li>
                <li><a href="#contact">Contact</a></li>
            </ul>
            <div className='flex items-center gap-4'>
                <button>
                    <FaMoon />
                </button>
                <a href="#contact" className='hidden lg:flex items-center gap-3 px-10 py-2.5 border border-gray-500 rounded-full ml-4'>Contact</a>
                <button className='block md:hidden ml-3' onClick={openMenu}>
                    <MdOutlineMenu className='h-7 w-7' />
                </button>
            </div>

            <ul ref={sideMenuRef} className='flex md:hidden flex-col gap-4 py-20 px-10 fixed -right-64 top-0 bottom-0 w-64 z-50 h-screen bg-green-50 transition duration-500'>
                <div className='absolute right-6 top-6' onClick={closeMenu}>
                    <IoIosClose className='h-10 w-10 cursor-pointer' />
                </div>
                <li><a onClick={closeMenu} href="#home">Home</a></li>
                <li><a onClick={closeMenu} href="#about">About</a></li>
                <li><a onClick={closeMenu} href="#projects">Projects</a></li>
                <li><a onClick={closeMenu} href="#contact">Contact</a></li>
            </ul>
        </nav>
    </>
  )
}

export default Navbar