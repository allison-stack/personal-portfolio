import React from 'react'

const Header = () => {
  return (
    <div>
        <div>
            
        </div>
        <h3 className='flex items-end gap-2 text-xl md:text-2xl mb-3 font-Ovo'>
            Hi! I'm Allison
        </h3>
        <h1 className='text-3xl sm:text-6xl lg:text-[66px] font-Ovo'>
            web developer
            <p className='max-w-2xl mx-auto font-Ovo'>
                I'm a full stack web developer specializing in building (and occasionally designing) exceptional digital experiences. Currently, I'm focused on building responsive full-stack web applications.
            </p>
            <div className="flex flex-col sm:flex-row items-center gap-4 mt-4">
                <a href="#contact" className="px-10 py-3 border border-white rounded-full bg-black text-white flex items-center gap-2">contact me</a>
                <a href="/resume.pdf" download className="px-10 py-3 border rounded-full border-gray-500 flex items-center gap-2">my resume</a>
            </div>
        </h1>
    </div>
  )
}

export default Header