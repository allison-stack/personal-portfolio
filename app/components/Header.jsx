import React from 'react'
import Image from 'next/image'

const Header = () => {
  return (
    <div id="home" className='w-11/12 max-w-4xl text-center mx-auto min-h-screen flex flex-col items-center justify-center gap-8 px-4 pt-20 pb-8'>
        <div className="relative w-48 h-60 lg:w-56 lg:h-72 mb-4 z-0">
            <Image
                src="/profile_picture.png"
                alt="Allison Zhao"
                fill
                className="rounded-2xl object-cover shadow-lg"
                style={{border: '2px solid var(--accent-primary)'}}
                priority
            />
        </div>
        
        <div className="space-y-6 max-w-2xl">
            <div className="space-y-2">
                <h3 className='text-lg md:text-xl font-Ovo tracking-wide' style={{color: 'var(--text-secondary)'}}>
                    I'm Allison!
                </h3>
                <h1 className='text-4xl sm:text-5xl lg:text-7xl font-Ovo leading-tight' style={{color: 'var(--text-primary)'}}>
                    a software engineer
                </h1>
            </div>
            
            <div className="space-y-4 pt-2">
                <p className='text-base md:text-lg leading-relaxed' style={{color: 'var(--text-secondary)'}}>
                    I'm a student based in Toronto studying computer science. When I'm not coding, I'm learning about optimization, watching cat videos, and staying active.
                </p>
                <p className='text-base md:text-lg leading-relaxed' style={{color: 'var(--text-secondary)'}}>
                    I'm looking for summer 2026 internships! Send me an email if you (or friends) are hiring.
                </p>
            </div>
        </div>
        
        <div className="flex flex-col sm:flex-row items-center gap-3 mt-4">
            <a 
                href="#contact" 
                className="px-6 py-2.5 border rounded-full text-sm md:text-base transition-all duration-200 hover-lift font-medium" 
                style={{
                    borderColor: 'var(--accent-primary)', 
                    backgroundColor: 'var(--accent-primary)', 
                    color: 'white'
                }}
            >
                contact me
            </a>
            <a 
                href="/Allison_Zhao_Resume_SWE.pdf" 
                download 
                className="px-6 py-2.5 border rounded-full text-sm md:text-base transition-all duration-200 hover-lift font-medium" 
                style={{
                    borderColor: 'var(--border-primary)', 
                    color: 'var(--text-primary)',
                    backgroundColor: 'transparent'
                }}
            >
                my resume
            </a>
        </div>
    </div>
  )
}

export default Header


// <div id="home" className='w-11/12 max-w-6xl mx-auto h-screen flex flex-col lg:flex-row items-center justify-center gap-8'>
// {/* Profile Picture */}
// <div className="flex-shrink-0 order-2 lg:order-1">
//     <div className="relative w-48 h-60 lg:w-56 lg:h-72">
//         <Image
//             src="/profile_picture.png"
//             alt="Allison Zhao"
//             fill
//             className="rounded-lg object-cover shadow-lg"
//             style={{border: '3px solid var(--accent-primary)'}}
//             priority
//         />
//     </div>
// </div>

// {/* Header Content */}
// <div className="text-center lg:text-left flex-1 order-1 lg:order-2">
//     <h3 className='flex items-end gap-2 text-xl md:text-2xl mb-3 font-Ovo' style={{color: 'var(--text-primary)'}}>
//         I'm Allison!
//     </h3>
//     <h1 className='text-3xl sm:text-6xl lg:text-[66px] font-Ovo' style={{color: 'var(--text-primary)'}}>
//         a software engineer
//     </h1>
//     <p className='max-w-2xl mx-auto lg:mx-0 font-Ovo' style={{color: 'var(--text-secondary)'}}>
//         I'm a student based in Toronto studying computer science. When I'm not coding, I'm learning about optimization, watching cat videos, and staying active.
//     </p>
//     <p className='max-w-2xl mx-auto lg:mx-0 font-Ovo' style={{color: 'var(--text-secondary)'}}>
//         I'm looking for summer 2026 internships! Send me an email if you (or friends) are hiring ; 
//     </p>
//     <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
//         <a href="#contact" className="px-8 py-3 border rounded-full flex items-center gap-2 transition-all duration-200 hover:opacity-80 hover-lift" style={{borderColor: 'var(--accent-primary)', backgroundColor: 'var(--accent-primary)', color: 'white'}}>contact me</a>
//         <a href="/Allison_Zhao's_Resume.pdf" download className="px-8 py-3 border rounded-full flex items-center gap-2 transition-all duration-200 hover:opacity-80 hover-lift" style={{borderColor: 'var(--border-primary)', color: 'var(--text-primary)'}}>my resume</a>
//     </div>