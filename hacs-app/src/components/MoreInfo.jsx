import { Link } from 'react-router-dom'
import { useState } from 'react'
import Galaxy from './Galaxy'

function MoreInfo() {
  const asteroids = [
    {
      name: "Vesta",
      image: "/images.jpg",  // Updated path
      description: "Vesta is one of the largest objects in the asteroid belt between Mars and Jupiter. It contains about 9% of the total mass of the asteroid belt and is the second-most-massive asteroid.",
      diameter: "525 kilometers",
      discovered: "1807",
      classification: "Main-belt asteroid"
    },
    {
      name: "Ceres",
      image: "ceres.jpg",  // Using the same image as placeholder
      description: "Ceres is the largest object in the asteroid belt and is now classified as a dwarf planet. It contains about one-third of the asteroid belt's total mass.",
      diameter: "940 kilometers",
      discovered: "1801",
      classification: "Dwarf planet/asteroid"
    },
    {
      name: "Pallas",
      image: "/palas.jpg",  // Using the same image as placeholder
      description: "Pallas is the third-largest asteroid in the Solar System and one of the largest proto-planets remaining intact since the formation of the Solar System.",
      diameter: "512 kilometers",
      discovered: "1802",
      classification: "Main-belt asteroid"
    }
    // You can add more asteroids following the same pattern
  ];

  return (
    <div className='w-full min-h-screen bg-black text-white'>
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
 <div className='container mx-auto relative z-10 px-8 py-16'>
  
        <div className='flex items-center mb-12'>
          <Link to="/" className='text-white/80 hover:text-white transition-colors mr-4'>
            ← Back to Home
          </Link>
          <h1 className='text-4xl font-bold'>Notable Asteroids</h1>
        </div>

        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
          {asteroids.map((asteroid, index) => (
            <div key={index} className='group relative overflow-hidden rounded-xl aspect-square'>
              {/* Image */}
              <img 
                src={asteroid.image} 
                alt={asteroid.name}
                className='w-full h-full object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-20'
              />
              
              {/* Overlay Content */}
              <div className='absolute inset-0 p-6 flex flex-col justify-end opacity-0 group-hover:opacity-100 transition-opacity duration-500'>
                <h2 className='text-2xl font-bold mb-2'>{asteroid.name}</h2>
                <div className='space-y-2'>
                  <p className='text-sm text-white/90'>{asteroid.description}</p>
                  <div className='pt-4 grid grid-cols-2 gap-4 text-sm'>
                    <div>
                      <p className='text-white/60'>Diameter</p>
                      <p className='font-medium'>{asteroid.diameter}</p>
                    </div>
                    <div>
                      <p className='text-white/60'>Discovered</p>
                      <p className='font-medium'>{asteroid.discovered}</p>
                    </div>
                  </div>
                  <p className='text-sm text-white/60 pt-2'>
                    Classification: {asteroid.classification}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>


    </div>
     
    
  )
}

export default MoreInfo
