import React from 'react'

const About = () => {
  return (
    <div id='about' className='w-full px-[12%]
     py-10 scroll-mt-20'>
        <h4 className='text-center mb-2 text-lg font-Ovo'>Introduction</h4>
        <h2 className='text-center text-5xl font-Ovo'>About Me</h2>
        <div className='flex w-full flex-col lg:flex-row items-center gap-20 my-20'>
            <div className='w-64 sm:w-80 rounded-3xl max-w-none'>
                <h4>Image</h4>
            </div>
            <div className='flex-1'>
                <p>
                    Hello! My name is Allison and I'm a software developer...
                </p>
                <ul>
                    <li>display familiar programming languages here as cards</li>
                </ul>
            </div>
        </div>
    </div>
  )
}

export default About