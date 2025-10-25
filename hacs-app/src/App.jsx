import { useState } from 'react'
import './App.css'
import AsteroidScene from './components/AsteroidScene'
import Galaxy from './components/Galaxy'
import Marquee from './components/Marquee'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='w-full min-h-screen bg-black'>
      {/* Hero Section with Asteroid Background */}
      <div className='relative w-full h-screen'>
        {/* Background */}
        <div className='absolute inset-0'>
          <AsteroidScene />
        </div>
        
        {/* Content Overlay */}
        <div className='absolute inset-0 z-20 flex flex-col items-center justify-center'>
          <h1 className='text-white text-center text-5xl md:text-6xl font-bold mb-8 px-4'>
            Hazardous Asteroid Classification System
          </h1>
          <p className='text-white/80 text-center text-xl md:text-2xl max-w-3xl px-8'>
            Advanced AI-powered system for detecting and classifying potentially hazardous asteroids
          </p>
        </div>
      </div>

      {/* Marquee Separators */}
      <div className='relative z-30'>
        <Marquee speed={30} direction="left" pauseOnHover={true} className="bg-black border-t-2 border-white py-2">
          <span className="text-white text-lg mx-4">
            HACKTOBER FEST 2024 - TEAM 009 - HAZARDOUS ASTEROID CLASSIFICATION SYSTEM
          </span>
        </Marquee>
        <Marquee speed={30} direction="right" pauseOnHover={true} className="bg-black border-b-2 border-white py-2">
          <span className="text-white text-lg mx-4">
            HACKTOBER FEST 2024 - TEAM 009 - HAZARDOUS ASTEROID CLASSIFICATION SYSTEM
          </span>
        </Marquee>
      </div>

      {/* Additional Content Below Hero */}
      <div className='relative w-full min-h-screen'>
        {/* Galaxy Background */}
        <div className='absolute inset-0 z-0'>
          <Galaxy 
            mouseRepulsion={false}
            mouseInteraction={true}
            density={1}
            glowIntensity={0.5}
            saturation={0}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.5}
            animatonSpeed={1}
            hueShift={140}
          />
        </div>
        
        {/* Content Overlay */}
        <div className='relative z-10 container mx-auto px-8 py-16'>
          <h2 className='text-white text-center text-3xl font-bold mb-8'>
            About the System
          </h2>
          <p className='text-white/80 text-center text-xl max-w-4xl mx-auto leading-relaxed'>
            Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet sint optio iusto totam vitae aperiam consectetur ratione similique illo, veniam rem ut tenetur facere quos qui nihil atque corrupti ipsa!
          </p>
        </div>
      </div>
    </div>
  )
}

export default App
