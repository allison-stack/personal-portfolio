import React from 'react';
import { FaGithub, FaLinkedin, FaEnvelope } from 'react-icons/fa';

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
                I'm currently looking for summer 2026 SWE internships. Send me an email if you (or friends) are hiring!
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
              
              <a
                href="https://www.linkedin.com/in/allison-zhao-41a3a21b6/"
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-3 p-3 rounded-lg transition-all duration-200 hover:opacity-80"
                style={{backgroundColor: 'var(--bg-secondary)'}}
              >
                <FaLinkedin style={{color: 'var(--accent-primary)'}} size={20} />
                <span style={{color: 'var(--text-primary)'}}>linkedin.com/in/allison-zhao-41a3a21b6/</span>
              </a>
            </div>
          </div>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-2xl font-Ovo mb-4" style={{color: 'var(--text-primary)'}}>
                Positions I'm interested in:
              </h3>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                <h4 className="font-Ovo font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  Software Engineer
                </h4>
              </div>
              
              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                <h4 className="font-Ovo font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  Data Analyst
                </h4>
              </div>
              
              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                <h4 className="font-Ovo font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  Machine Learning Engineer
                </h4>
              </div>

              <div className="p-4 rounded-lg" style={{backgroundColor: 'var(--bg-secondary)'}}>
                <h4 className="font-Ovo font-semibold mb-2" style={{color: 'var(--text-primary)'}}>
                  DevOps Engineer
                </h4>
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
