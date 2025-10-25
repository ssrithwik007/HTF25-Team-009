import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import AsteroidScene from './components/AsteroidScene'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className='w-full min-h-screen bg-black'>
      <h1 className='text-white text-center text-4xl font-bold mb-4 pt-4'>Hazardous Asteroid Classification System</h1>
      <AsteroidScene />
      <h1 className='text-white text-center text-2xl font-bold mb-4 px-8 py-8'>Lorem ipsum, dolor sit amet consectetur adipisicing elit. Eveniet sint optio iusto totam vitae aperiam consectetur ratione similique illo, veniam rem ut tenetur facere quos qui nihil atque corrupti ipsa!
      </h1>
    </div>
  )
}

export default App
