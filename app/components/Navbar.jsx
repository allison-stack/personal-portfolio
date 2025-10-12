import React from 'react'
import { FaMoon } from 'react-icons/fa';
import { MdOutlineMenu } from "react-icons/md";

const Navbar = () => {
  return (
    <>
        <nav className='w-full fixed px-5 lg:px-8 xl:px-[8%] py-4 flex items-center justify-between z-50'>
            <a href="#top">
                
            </a>
            <ul className='hidden md:flex items-center gap-6 lg:gap-8 rounded-full px-12 py-3 bg-white shadow-sm bg-opacity-50'>
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
                <button className='block md:hidden ml-3'>
                    <MdOutlineMenu />
                </button>
            </div>
        </nav>
    </>
  )
}

export default Navbar