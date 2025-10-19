import React from 'react'

const About = () => {
  return (
    <div id='about' className='w-full px-[12%] py-10 scroll-mt-20 fade-in-up' style={{backgroundColor: 'var(--bg-primary)'}}>
        <h4 className='text-center mb-2 text-lg font-Ovo' style={{color: 'var(--text-secondary)'}}>Read more...</h4>
        <h2 className='text-center text-5xl font-Ovo' style={{color: 'var(--text-primary)'}}>About Me</h2>
        <div className='flex w-full flex-col lg:flex-row items-center gap-20 my-10'>
            <div className='flex-1 space-y-4'>
                <p style={{color: 'var(--text-primary)'}}>
                    I'm someone who loves picking up new things/experiences. I enjoy all things tech, food, sports, science, and much more. My willingness to explore results in more hobbies being made.
                </p>
                <p style={{color: 'var(--text-primary)'}}>
                    I rotate through many hobbies. I go hiking, play badminton with friends, stargaze, and I'm currently aiming to eat my way through popular restaurants in Markham.
                </p>
                <div className="mt-6 p-4 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                    <p className="text-sm" style={{color: 'var(--text-muted)'}}>
                        📸 Photo gallery coming soon...
                    </p>
                </div>
            </div>
        </div>
    </div>
  )
}

export default About