import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';

const Contact = () => {
  return (
    <div id="contact" className="w-full px-[12%] py-10 scroll-mt-20 fade-in-up" style={{backgroundColor: 'var(--bg-primary)'}}>
      <h4 className="text-center mb-2 text-lg font-Ovo" style={{color: 'var(--text-secondary)'}}>Get in touch</h4>
      <h2 className="text-center text-5xl font-Ovo mb-10" style={{color: 'var(--text-primary)'}}>Contact</h2>
      
      <div className="max-w-4xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Contact Info */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-Ovo mb-4" style={{color: 'var(--text-primary)'}}>
                Let's connect!
              </h3>
              <p style={{color: 'var(--text-secondary)'}}>
                I'm always interested in new opportunities and collaborations. 
                Whether you have a project in mind or just want to chat about technology, 
                feel free to reach out!
              </p>
            </div>
            
            <div className="space-y-4">
              <a
                href="mailto:allisonzhao.uni@gmail.com"
                className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:opacity-80"
                style={{backgroundColor: 'var(--bg-secondary)'}}
              >
                <FaEnvelope style={{color: 'var(--accent-primary)'}} size={20} />
                <span style={{color: 'var(--text-primary)'}}>allisonzhao.uni@gmail.com</span>
              </a>
              
              <a
                href="https://github.com/allison-stack"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:opacity-80"
                style={{backgroundColor: 'var(--bg-secondary)'}}
              >
                <FaGithub style={{color: 'var(--accent-primary)'}} size={20} />
                <span style={{color: 'var(--text-primary)'}}>github.com/allison-stack</span>
              </a>
              
              <div className="flex items-center gap-3 p-3 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                <FaMapMarkerAlt style={{color: 'var(--accent-primary)'}} size={20} />
                <span style={{color: 'var(--text-primary)'}}>Toronto, Canada</span>
              </div>
            </div>
          </div>
          
          {/* Quick Facts */}
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-Ovo mb-4" style={{color: 'var(--text-primary)'}}>
                Quick facts
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                <h4 className="font-Ovo font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  Currently working on
                </h4>
                <p style={{color: 'var(--text-secondary)'}}>
                  Optimizing Huawei's SQL engine
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                <h4 className="font-Ovo font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  Learning
                </h4>
                <p style={{color: 'var(--text-secondary)'}}>
                  AI/ML and quantum computing
                </p>
              </div>
              
              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                <h4 className="font-Ovo font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  Fun fact
                </h4>
                <p style={{color: 'var(--text-secondary)'}}>
                  I love rock climbing! 🧗‍♀️
                </p>
              </div>
            </div>
          </div>
        </div>
        
        <div className="text-center mt-12">
          <p style={{color: 'var(--text-muted)'}}>
            Built with Next.js, React, and Tailwind CSS
          </p>
        </div>
      </div>
    </div>
  );
};

export default Contact;
