'use client';
import React, { useState, useEffect } from 'react';
import { FaGithub, FaExternalLinkAlt, FaStar, FaCodeBranch } from 'react-icons/fa';

const Projects = () => {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  const pinnedProjects = [
    {
        name: "RexFlection",
        description: "Transforms your photo albums into a trip down memory lane",
        language: "JavaScript",
        stars: 0,
        forks: 1,
        url: "https://github.com/angrylaa/RexFlection",
        topics: ["YOLOv8", "NLP", "Google Photos API"]
    },
    {
        name: "mac-FAQ-chatbot",
        description: "A chatbot built for McMaster students to answer common questions",
        language: "SQL",
        stars: 4,
        forks: 0,
        url: "https://github.com/DSC-McMaster-U/mac-FAQ-chatbot",
        topics: ["chatbot", "Google Cloud", "university"]
    },
    {
        name: "EyeQ",
        description: "Using eye tracking to increase productivity",
        language: "Python",
        stars: 0,
        forks: 0,
        url: "https://github.com/allison-stack/EyeQ",
        topics: ["computer-vision", "eye-tracking", "Python"]
      },
    {
      name: "Math-Visualizer",
      description: "Integral graphing calculator built with Elm",
      language: "Elm",
      stars: 0,
      forks: 0,
      url: "https://github.com/allison-stack/Math-Visualizer",
      topics: ["calculus", "visualization", "Elm"]
    },
    {
      name: "Small-scale-QAOA",
      description: "Implementation of a Quantum Approximate Optimization Algorithm",
      language: "Jupyter Notebook",
      stars: 0,
      forks: 0,
      url: "https://github.com/allison-stack/Small-scale-QAOA",
      topics: ["quantum-computing", "optimization", "qiskit"]
    }
  ];

  useEffect(() => {
    const timer = setTimeout(() => {
      setProjects(pinnedProjects);
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  const getLanguageColor = (language) => {
    const colors = {
      'Elm': '#60B5CC',
      'Python': '#3776ab',
      'Jupyter Notebook': '#F37626',
      'JavaScript': '#f7df1e',
      'TypeScript': '#3178c6',
      'React': '#61dafb',
      'Next.js': '#000000',
      'SQL': '#e34c26'
    };
    return colors[language] || '#6b7280';
  };

  if (loading) {
    return (
      <div id="projects" className="w-full px-[12%] py-10 scroll-mt-20" style={{backgroundColor: 'var(--bg-primary)'}}>
        <h4 className="text-center mb-2 text-lg font-Ovo" style={{color: 'var(--text-secondary)'}}>Featured work</h4>
        <h2 className="text-center text-5xl font-Ovo mb-10" style={{color: 'var(--text-primary)'}}>Projects</h2>
        <div className="flex justify-center items-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{borderColor: 'var(--accent-primary)'}}></div>
        </div>
      </div>
    );
  }

  return (
    <div id="projects" className="w-full px-[12%] py-10 scroll-mt-20 fade-in-up" style={{backgroundColor: 'var(--bg-primary)'}}>
      <h4 className="text-center mb-2 text-lg font-Ovo" style={{color: 'var(--text-secondary)'}}>Featured work</h4>
      <h2 className="text-center text-5xl font-Ovo mb-10" style={{color: 'var(--text-primary)'}}>Projects</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {projects.map((project, index) => (
          <div
            key={index}
            className="group relative p-6 rounded-lg border hover-lift fade-in-up"
            style={{
              backgroundColor: 'var(--bg-secondary)',
              borderColor: 'var(--border-primary)',
              boxShadow: 'var(--shadow-sm)'
            }}
          >
            <div className="flex items-start justify-between mb-4">
              <h3 className="text-xl font-Ovo font-semibold" style={{color: 'var(--text-primary)'}}>
                {project.name}
              </h3>
              <div className="flex gap-2">
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-all duration-200 hover:bg-opacity-10 hover:bg-gray-500"
                  style={{color: 'var(--text-secondary)'}}
                  aria-label="View on GitHub"
                >
                  <FaGithub size={16} />
                </a>
                <a
                  href={project.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full transition-all duration-200 hover:bg-opacity-10 hover:bg-gray-500"
                  style={{color: 'var(--text-secondary)'}}
                  aria-label="Open project"
                >
                  <FaExternalLinkAlt size={14} />
                </a>
              </div>
            </div>
            
            <p className="mb-4 text-sm" style={{color: 'var(--text-secondary)'}}>
              {project.description}
            </p>
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{backgroundColor: getLanguageColor(project.language)}}
                ></div>
                <span className="text-sm" style={{color: 'var(--text-muted)'}}>
                  {project.language}
                </span>
              </div>
              
              <div className="flex items-center gap-4 text-sm" style={{color: 'var(--text-muted)'}}>
                <div className="flex items-center gap-1">
                  <FaStar size={12} />
                  <span>{project.stars}</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaCodeBranch size={12} />
                  <span>{project.forks}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {project.topics.slice(0, 3).map((topic, topicIndex) => (
                <span
                  key={topicIndex}
                  className="px-2 py-1 text-xs rounded-full"
                  style={{
                    backgroundColor: 'var(--bg-tertiary)',
                    color: 'var(--text-secondary)'
                  }}
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="text-center mt-10">
        <a
          href="https://github.com/allison-stack"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 px-6 py-3 border rounded-full transition-all duration-200 hover:opacity-80"
          style={{
            borderColor: 'var(--border-primary)',
            color: 'var(--text-primary)'
          }}
        >
          <FaGithub />
          View all projects on GitHub
        </a>
      </div>
    </div>
  );
};

export default Projects;
