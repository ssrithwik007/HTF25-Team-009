import { useState } from 'react'
import './App.css'
import AsteroidScene from './components/AsteroidScene'
import Galaxy from './components/Galaxy'
import Marquee from './components/Marquee'
import EarthScene from './components/EarthScene'

function App() {
  const [count, setCount] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
      setUploadResult(null);
      setError(null);
    }
  }

  const handleSubmit = async () => {
    if (!selectedFile) return;

    setIsLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      setUploadResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

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

      {/* File Upload Section */}
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
            Check your Asteroid
          </h2>

          {/* File Upload Section */}
          <div className='max-w-3xl mx-auto p-6 bg-white/10 backdrop-blur-sm rounded-3xl'>
            <h3 className='text-white text-xl font-semibold mb-4 text-center'>
              Upload Your YAML File
            </h3>
            <div className='flex flex-col items-center w-full'>
              <label 
                htmlFor='yamlFile' 
                className='w-full border-2 border-dashed border-white/50 rounded-lg p-8 text-center cursor-pointer hover:border-white/80 transition-colors'
              >
                <div className='text-white/80'>
                  {selectedFile ? (
                    <p className='mb-2'>Selected file: {selectedFile.name}</p>
                  ) : (
                    <>
                      <p className='mb-2'>Drag and drop your YAML file here</p>
                      <p className='text-sm'>or click to browse</p>
                    </>
                  )}
                </div>
                <input 
                  type='file' 
                  id='yamlFile' 
                  accept='.yaml,.yml'
                  className='hidden'
                  onChange={handleFileUpload}
                />
              </label>
              <p className='text-white/60 text-sm mt-4'>
                Supported formats: .yaml, .yml
              </p>
              
              {error && (
                <p className='text-red-500 mt-4'>
                  Error: {error}
                </p>
              )}
              
              {isLoading && (
                <div className='mt-4 text-white'>
                  Processing...
                </div>
              )}

              {uploadResult && (
                <div className='mt-6 w-full bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20'>
                  <h4 className='text-white text-xl font-semibold mb-4'>Analysis Results</h4>
                  
                  <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                    {/* Hazard Status */}
                    <div className={`p-4 rounded-xl ${
                      uploadResult.is_hazardous 
                        ? 'bg-red-500/20 border border-red-500/50' 
                        : 'bg-green-500/20 border border-green-500/50'
                    }`}>
                      <h5 className='text-white text-lg font-medium mb-2'>Hazard Status</h5>
                      <p className='text-white/90 text-2xl font-bold'>
                        {uploadResult.is_hazardous ? 'Hazardous' : 'Non-Hazardous'}
                      </p>
                    </div>

                    {/* Confidence Score */}
                    <div className='bg-white/10 p-4 rounded-xl border border-white/20'>
                      <h5 className='text-white text-lg font-medium mb-2'>Hazard Probability</h5>
                      <p className='text-white/90 text-2xl font-bold'>
                        {(uploadResult.hazard_probability * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {selectedFile && !isLoading && (
                <button
                  onClick={handleSubmit}
                  className='mt-6 px-6 py-2 bg-black hover:bg-gray-900 text-white rounded-lg transition-colors disabled:opacity-50'
                  disabled={isLoading}
                >
                  {isLoading ? 'Processing...' : 'Submit File'}
                </button>
              )}
            </div>
          </div>
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
    </div>
  )
}

export default App
