import React from 'react'

const Header = () => {
  return (
    <div id="home" className='w-11/12 max-w-3xl text-center mx-auto h-screen flex flex-col items-center justify-center gap-4'>
        <div>
            
        </div>
        <h3 className='flex items-end gap-2 text-xl md:text-2xl mb-3 font-Ovo' style={{color: 'var(--text-primary)'}}>
            I'm Allison!
        </h3>
        <h1 className='text-3xl sm:text-6xl lg:text-[66px] font-Ovo' style={{color: 'var(--text-primary)'}}>
            software engineer
        </h1>
        <p className='max-w-2xl mx-auto font-Ovo' style={{color: 'var(--text-secondary)'}}>
            I'm a student based in Toronto studying computer science. When I'm not coding, I'm learning about optimization, watching cat videos, and staying active.
        </p>
        <div className="flex flex-col sm:flex-row items-center gap-4 mt-8">
            <a href="#contact" className="px-8 py-3 border rounded-full flex items-center gap-2 transition-all duration-200 hover:opacity-80 hover-lift" style={{borderColor: 'var(--accent-primary)', backgroundColor: 'var(--accent-primary)', color: 'white'}}>contact me</a>
            <a href="/resume.pdf" download className="px-8 py-3 border rounded-full flex items-center gap-2 transition-all duration-200 hover:opacity-80 hover-lift" style={{borderColor: 'var(--border-primary)', color: 'var(--text-primary)'}}>my resume</a>
        </div>
    </div>
  )
}

export default Header