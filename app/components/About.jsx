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
    <div id='about' className='w-full px-6 sm:px-8 lg:px-[10%] py-16 lg:py-20 scroll-mt-20 fade-in-up' style={{backgroundColor: 'var(--bg-primary)'}}>
        <div className='max-w-5xl mx-auto'>
            <div className='text-center mb-12'>
                <h4 className='mb-3 text-base md:text-lg font-Ovo tracking-wide' style={{color: 'var(--text-secondary)'}}>Read more...</h4>
                <h2 className='text-4xl md:text-5xl lg:text-6xl font-Ovo' style={{color: 'var(--text-primary)'}}>About Me</h2>
            </div>
            
            <div className='max-w-4xl mx-auto space-y-10'>
                {/* Text Content */}
                <div className='space-y-6'>
                    <p className='text-base md:text-lg leading-relaxed' style={{color: 'var(--text-primary)'}}>
                        I'm somewhat of a hobby collector. I find myself picking up new skills and passions here and there, especially in tech, food, science, and sports.
                    </p>
                    
                    <div className='space-y-5'>
                        <h3 className='text-lg md:text-xl font-Ovo' style={{color: 'var(--text-primary)'}}>
                            Lately I've been spending my time on:
                        </h3>
                        <ul className='space-y-4 pl-0'>
                            <li className='flex gap-4'>
                                <span className='text-lg font-Ovo mt-1' style={{color: 'var(--accent-primary)'}}>•</span>
                                <div>
                                    <span className='font-medium' style={{color: 'var(--text-primary)'}}>Leading in Tech:</span>
                                    <span className='ml-2 text-base leading-relaxed' style={{color: 'var(--text-secondary)'}}>
                                        Helping organize DeltaHacks as a VP and leading software development for McMaster's Quantum Key Distribution team
                                    </span>
                                </div>
                            </li>
                            <li className='flex gap-4'>
                                <span className='text-lg font-Ovo mt-1' style={{color: 'var(--accent-primary)'}}>•</span>
                                <div>
                                    <span className='font-medium' style={{color: 'var(--text-primary)'}}>Eating My Way Around:</span>
                                    <span className='ml-2 text-base leading-relaxed' style={{color: 'var(--text-secondary)'}}>
                                        I'm always on the hunt for great tasting local food. My top picks so far are: Ramen/Udon, Korean BBQ, and Chipotle Burrito Bowls
                                    </span>
                                </div>
                            </li>
                            <li className='flex gap-4'>
                                <span className='text-lg font-Ovo mt-1' style={{color: 'var(--accent-primary)'}}>•</span>
                                <div>
                                    <span className='font-medium' style={{color: 'var(--text-primary)'}}>Keeping Active:</span>
                                    <span className='ml-2 text-base leading-relaxed' style={{color: 'var(--text-secondary)'}}>
                                        You'll often find me playing a competitive game of badminton/ping pong with friends, or trying my best at rock climbing (I have a lot to work on strength-wise haha)
                                    </span>
                                </div>
                            </li>
                            <li className='flex gap-4'>
                                <span className='text-lg font-Ovo mt-1' style={{color: 'var(--accent-primary)'}}>•</span>
                                <div>
                                    <span className='font-medium' style={{color: 'var(--text-primary)'}}>For Funsies:</span>
                                    <span className='ml-2 text-base leading-relaxed' style={{color: 'var(--text-secondary)'}}>
                                        I test out new photography techniques when inspiration strikes, and indulge in the occasional stargazing session
                                    </span>
                                </div>
                            </li>
                        </ul>
                    </div>
                </div>
                
                {/* Photo Gallery Carousel */}
                <div className="mt-12 w-full">
                    <div className="relative w-full max-w-4xl mx-auto aspect-video rounded-xl overflow-hidden shadow-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                        <div className="relative w-full h-full">
                            {photos.map((photo, index) => (
                                <div 
                                    key={index} 
                                    className={`absolute inset-0 transition-opacity duration-1000 ${index === currentIndex ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} 
                                    onMouseEnter={() => index === currentIndex && setHoveredIndex(index)} 
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <Image 
                                        src={photo.src} 
                                        alt={photo.caption} 
                                        fill 
                                        className="object-cover" 
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 80vw, 1200px" 
                                    />
                                    <div 
                                        className={`absolute bottom-0 left-0 right-0 p-4 transition-all duration-300 ${hoveredIndex === index && index === currentIndex ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`} 
                                        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.8), transparent)', color: 'white'}}
                                    >
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