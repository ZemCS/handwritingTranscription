import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import ImageUpload from './imageUpload'
function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div>
        <ImageUpload />
      </div>
    </>
  )
}

export default App
