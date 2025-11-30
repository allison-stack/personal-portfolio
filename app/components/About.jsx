'use client';
import React, { useState, useEffect } from 'react'
import Image from 'next/image'

const About = () => {
  const photos = [
    { src: '/badminton_with_friends.png', caption: 'Playing badminton with friends' },
    { src: '/DeltaHacks_moment.png', caption: 'DeltaHacks organizing team moment' },
    { src: '/intern_rock_climbing.png', caption: 'Rock climbing during internship' },
    { src: '/noodles_with_friends.png', caption: 'Enjoying noodles with friends' },
    { src: '/studying.png', caption: 'Study session' },
    { src: '/team_building_jbbq.png', caption: 'Team building at Korean BBQ' }
  ];

  const [currentIndex, setCurrentIndex] = useState(0);
  const [hoveredIndex, setHoveredIndex] = useState(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }, 4000);

    return () => clearInterval(interval);
  }, [photos.length]);

  return (
    <div id='about' className='w-full px-[12%] py-10 scroll-mt-20 fade-in-up' style={{backgroundColor: 'var(--bg-primary)'}}>
        <h4 className='text-center mb-2 text-lg font-Ovo' style={{color: 'var(--text-secondary)'}}>Read more...</h4>
        <h2 className='text-center text-5xl font-Ovo' style={{color: 'var(--text-primary)'}}>About Me</h2>
        <div className='flex w-full flex-col lg:flex-row items-center gap-20 my-10'>
            <div className='flex-1 space-y-4'>
                <p style={{color: 'var(--text-primary)'}}>
                    I'm someone who loves picking up new things. I enjoy all things tech, food, sports, science, and much more. It's no wonder I make new hobbies often haha...
                </p>
                <div style={{color: 'var(--text-primary)'}}>
                    I rotate through many hobbies:
                    <li>Tech-wise I'm thoroughly involved in my university community, I'm a VP on the DeltaHacks organizing team and a software developer lead for McMaster's Quantum Key Distribution Team</li>
                    <li>Food-wise I love experiencing local food! Some of my favorites are kbbq, noodles, and burrito bowls</li>
                    <li>Staying active is a must for me. You can often see me hiking, playing badminton with friends, and trying my best at rock climbing</li>
                    <li>Some miscellaneous hobbies of mine include photography and stargazing</li>
                </div>
                
                {/* Photo Gallery Carousel */}
                <div className="mt-8 w-full">
                    <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-lg overflow-hidden shadow-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                        <div className="relative w-full h-full"> {photos.map((photo, index) => (
                                <div key={index} className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onMouseEnter={() => index === currentIndex && setHoveredIndex(index)} onMouseLeave={() => setHoveredIndex(null)}>
                                    <Image src={photo.src} alt={photo.caption} fill className="object-cover" sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px" />
                                    <div className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${hoveredIndex === index && index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white'}}>
                                        <p className="font-Ovo text-sm md:text-base">
                                            {photo.caption}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex gap-2 z-10">
                            {photos.map((_, index) => (
                                <button
                                    key={index}
                                    onClick={() => setCurrentIndex(index)}
                                    className={`h-2 rounded-full transition-all duration-300 ${
                                        index === currentIndex ? 'w-8' : 'w-2'
                                    }`}
                                    style={{
                                        backgroundColor: index === currentIndex 
                                            ? 'var(--accent-primary)' 
                                            : 'rgba(255, 255, 255, 0.5)'
                                    }}
                                    aria-label={`Go to slide ${index + 1}`}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  )
}

export default About