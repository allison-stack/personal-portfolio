import React from 'react'

const About = () => {
  return (
    <div id='about' className='w-full px-[12%] py-10 scroll-mt-20 fade-in-up' style={{backgroundColor: 'var(--bg-primary)'}}>
        <h4 className='text-center mb-2 text-lg font-Ovo' style={{color: 'var(--text-secondary)'}}>Read more...</h4>
        <h2 className='text-center text-5xl font-Ovo' style={{color: 'var(--text-primary)'}}>About Me</h2>
        <div className='flex w-full flex-col lg:flex-row items-center gap-20 my-10'>
            <div className='flex-1 space-y-4'>
                <p style={{color: 'var(--text-primary)'}}>
                    I'm someone who loves picking up new things. I enjoy all things tech, food, sports, science, and much more. It's no wonder I make new hobbies often haha...
                </p>
                <p style={{color: 'var(--text-primary)'}}>
                    I rotate through many hobbies:
                    Tech-wise I'm thoroughly involved in my university community, I'm a VP on the DeltaHacks organizing team and a software developer lead for McMaster's Quantum Key Distribution Team.
                    Food-wise I love experiencing local food. Some of my favorites are kbbq, noodles, and burrito bowls.
                    Staying active is a must for me. You can often see me hiking, playing badminton with friends, and trying my best at rock climbing.
                    Some miscellaneous hobbies include photography and stargazing.
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