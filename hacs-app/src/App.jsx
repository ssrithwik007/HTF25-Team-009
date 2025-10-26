import { useState, useRef } from 'react'
import { Routes, Route, Link } from 'react-router-dom'
import './App.css'
import AsteroidScene from './components/AsteroidScene'
import Galaxy from './components/Galaxy'
import Marquee from './components/Marquee'
import MoreInfo from './components/MoreInfo'
import ResultScene from './components/ResultScene'

function MainPage() {
  const [count, setCount] = useState(0)
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadResult, setUploadResult] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sceneKey, setSceneKey] = useState(0) // Key to force re-render of ResultScene
  const audioRef = useRef(null)

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
    
    // Reset the scene by incrementing the key
    setSceneKey(prev => prev + 1);

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
      
      // Scroll to result section after getting the result
      setTimeout(() => {
        const resultSection = document.getElementById('result-section');
        if (resultSection) {
          resultSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      }, 100);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  const playSound = () => {
    if (audioRef.current) {
      audioRef.current.currentTime = 0 // Reset to start
      audioRef.current.play()
      // Stop after 2 seconds
      setTimeout(() => {
        if (audioRef.current) {
          audioRef.current.pause()
          audioRef.current.currentTime = 0
        }
      }, 3500)
    }
  }

  return (
    
    <div className='w-full min-h-screen bg-black'>
      {/* Glassmorphism Navbar */}
      <div className='fixed top-0 left-0 right-0 py-4 bg-white/5 backdrop-blur-md border-b border-white/10 z-50'>
        <div className='container mx-auto px-8'>
          <div className='flex items-center justify-between max-w-7xl mx-auto'>
            {/* Logo */}
            <span className='text-white text-2xl font-medium orbitron-bold'>HACS</span>

            {/* More Info Button */}
            <Link to="/more-info">
              <button className='px-4 py-1.5 border border-white/30 rounded-md text-white text-xs font-medium hover:bg-white/20 hover:border-white/50 transition-all duration-300'>
                More Info
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* Hero Section with Asteroid Background */}
      <div className='relative w-full h-screen'>
        {/* Background */}
        <div className='absolute inset-0'>
          <AsteroidScene />
        </div>

        {/* Content Overlay */}
        <div className='absolute inset-0 z-20 flex flex-col items-center justify-center'>
          <h1 className='bitcount-grid-single text-white text-center text-5xl md:text-6xl font-bold mb-5 px-4'>
            HAZARDOUS ASTEROID CLASSIFICATION SYSTEM
          </h1>
          <p className='orbitron-regular text-white/80 text-center text-xl md:text-2xl max-w-3xl px-8'>
            Advanced AI-powered system for detecting and classifying potentially hazardous asteroids
          </p>
        </div>
      </div>
      

      {/* Marquee Separators */}
      <div className='relative z-30'>
        <Marquee speed={30} direction="left" pauseOnHover={true} className="bg-black border-t-2 border-white py-2">
          <span className="bitcount-grid-single text-white text-xl mx-4">
            HACKTOBER FEST 2025 - TEAM 009 - HAZARDOUS ASTEROID CLASSIFICATION SYSTEM
          </span>
        </Marquee>
        <Marquee speed={30} direction="right" pauseOnHover={true} className="bg-black border-b-2 border-white py-2">
          <span className="bitcount-grid-single text-white text-xl mx-4">
            HACKTOBER FEST 2025 - TEAM 009 - HAZARDOUS ASTEROID CLASSIFICATION SYSTEM
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
            glowIntensity={0.2}
            saturation={0}
            twinkleIntensity={0.2}
            rotationSpeed={0.1}
            repulsionStrength={2}
            autoCenterRepulsion={0}
            starSpeed={0.3}
            animatonSpeed={1}
            hueShift={0}
          />
        </div>

        {/* Content Overlay */}
        <div className='relative z-10 container mx-auto px-8 py-16'>
          <h2 className='orbitron-bold text-white text-center text-3xl font-bold mb-8'>
            Check your Asteroid
          </h2>

          {/* File Upload Section */}
          <div className='max-w-3xl mx-auto p-6 bg-white/10 backdrop-blur-sm rounded-3xl'>
            <h3 className='orbitron-regular text-white text-xl font-semibold mb-4 text-center'>
              Upload Your YAML File
            </h3>
            <div className='orbitron-regular flex flex-col items-center w-full'>
              <label 
                htmlFor='yamlFile' 
                className='w-full border-2 border-dashed border-white/50 rounded-lg p-8 text-center cursor-pointer hover:border-white/80 transition-colors'
              >
                <div className='orbitron-regular text-white/80'>
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
                <div className='orbitron-regular mt-6 w-full bg-white/10 backdrop-blur-sm p-6 rounded-2xl border border-white/20'>
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
                        {(uploadResult.confidence.hazard_probability * 100).toFixed(2)}%
                      </p>
                    </div>
                  </div>

                  {/* Interpretability Section */}
                    <div className='mt-6'>
                      {/* Confidence Level */}
                      <div className='bg-white/10 p-4 rounded-xl border border-white/20 mb-4'>
                        <div className='flex items-center justify-between'>
                          <div>
                            <h5 className='text-white text-lg font-medium mb-1'>Confidence Level</h5>
                            <p className='text-white/70 text-sm'>Model certainty in prediction</p>
                          </div>
                          <div className='text-right'>
                            <p className={`text-2xl font-bold ${
                              uploadResult.interpretability.confidence_level === 'HIGH' 
                                ? 'text-green-400' 
                                : uploadResult.interpretability.confidence_level === 'MEDIUM'
                                ? 'text-yellow-400'
                                : 'text-orange-400'
                            }`}>
                              {uploadResult.interpretability.confidence_level}
                            </p>
                            <p className='text-white/60 text-sm'>
                              {(uploadResult.interpretability.confidence_score * 100).toFixed(1)}%
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Top Influential Features */}
                      <div className='bg-white/10 p-4 rounded-xl border border-white/20'>
                        <h5 className='text-white text-lg font-medium mb-4'>Top Influential Features</h5>
                        <div className='space-y-3'>
                          {uploadResult.interpretability.top_5_influential_features.map((feature, index) => (
                            <div 
                              key={index}
                              className='bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition-all duration-200'
                            >
                              <div className='flex items-start justify-between mb-2'>
                                <div className='flex items-center gap-2'>
                                  <span className={`text-xl ${
                                    feature.impact_direction === 'INCREASES' ? '🔴' : '🟢'
                                  }`}>
                                    {feature.impact_direction === 'INCREASES' ? '🔴' : '🟢'}
                                  </span>
                                  <div>
                                    <h6 className='text-white font-medium text-sm'>{feature.feature}</h6>
                                    <p className='text-white/60 text-xs'>Value: {feature.actual_value}</p>
                                  </div>
                                </div>
                                <div className='text-right'>
                                  <p className='text-white/80 text-xs font-medium'>
                                    Impact: {(feature.contribution_score * 100).toFixed(2)}%
                                  </p>
                                  <p className={`text-xs font-semibold ${
                                    feature.impact_direction === 'INCREASES' ? 'text-red-400' : 'text-green-400'
                                  }`}>
                                    {feature.impact_direction}
                                  </p>
                                </div>
                              </div>
                              <p className='text-white/70 text-xs mt-2 leading-relaxed'>
                                {feature.explanation}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Summary */}
                      <div className='bg-white/10 p-4 rounded-xl border border-white/20 mt-4'>
                        <h5 className='text-white text-lg font-medium mb-3'>Analysis Summary</h5>
                        <div className='text-white/80 text-sm leading-relaxed whitespace-pre-line'>
                          {uploadResult.interpretability.summary}
                        </div>
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
          <span className="bitcount-grid-single text-white text-xl mx-4">
            HACKTOBER FEST 2025 - TEAM 009 - HAZARDOUS ASTEROID CLASSIFICATION SYSTEM
          </span>
        </Marquee>
        <Marquee speed={30} direction="right" pauseOnHover={true} className="bg-black border-b-2 border-white py-2">
          <span className="bitcount-grid-single text-white text-xl mx-4">
            HACKTOBER FEST 2025 - TEAM 009 - HAZARDOUS ASTEROID CLASSIFICATION SYSTEM
          </span>
        </Marquee>
      </div>

      {/* Result Section with Asteroid Background - Only show after result is available */}
      {uploadResult && (
        <div id='result-section' className='orbitron-regular relative w-full h-screen'>
          {/* Flashing border - only for hazardous */}
          {uploadResult?.is_hazardous && (
            <div className='absolute inset-0 border-20 border-red-600 pointer-events-none z-30 animate-pulse'></div>
          )}
          
          {/* Static green border - only for safe */}
          {!uploadResult?.is_hazardous && (
            <div className='absolute inset-0 border-20 border-green-500 pointer-events-none z-30'></div>
          )}
          
          {/* Background */}
          <div className='absolute inset-0'>
            <ResultScene key={sceneKey} isHazardous={uploadResult?.is_hazardous || false} />
          </div>
          
          {/* Content Overlay */}
          <div className='absolute inset-0 z-20 flex flex-col items-center justify-center'>
            {uploadResult?.is_hazardous ? (
              <>
                <h1 className='text-red-600 text-center text-8xl md:text-9xl font-black mb-8 px-4 animate-pulse drop-shadow-[0_0_30px_rgba(220,38,38,0.8)]'>
                  DANGER
                </h1>
                <p className='text-red-500 text-center text-3xl md:text-4xl font-bold animate-pulse'>
                  Hazard Probability: {(uploadResult.confidence.hazard_probability * 100).toFixed(2)}%
                </p>
              </>
            ) : (
              <>
                <h1 className='text-green-500 text-center text-8xl md:text-9xl font-black mb-8 px-4 drop-shadow-[0_0_30px_rgba(34,197,94,0.8)]'>
                  SAFE
                </h1>
                <p className='text-green-400 text-center text-3xl md:text-4xl font-bold'>
                  Hazard Probability: {(uploadResult.confidence.hazard_probability * 100).toFixed(2)}%
                </p>
              </>
            )}
          </div>

          {/* Sound Button - Bottom Right with RGB Border */}
          <div className='fixed bottom-8 right-8 z-40 w-14 h-14 rounded-full p-[2px] animate-spin-slow bg-gradient-to-r from-red-500 via-green-500 via-blue-500 to-red-500 bg-[length:200%_200%]'>
            <button
              onClick={playSound}
              className='w-full h-full rounded-full bg-black/80 backdrop-blur-md hover:bg-black/60 hover:scale-110 active:scale-95 transition-all duration-300 flex items-center justify-center group shadow-[0_0_20px_rgba(255,255,255,0.3)] hover:shadow-[0_0_30px_rgba(255,255,255,0.5)]'
              aria-label='Play sound'
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
            </button>
          </div>

          {/* Hidden Audio Element */}
          <audio ref={audioRef}>
            <source src="/music.mp3" type="audio/mpeg" />
            Your browser does not support the audio element.
          </audio>
        </div>
      )}

    </div>
  )
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<MainPage />} />
      <Route path="/more-info" element={<MoreInfo />} />
    </Routes>
  )
}

export default App
