import { Suspense } from 'react'
import './App.css'
import UserGallery from './components/UserGallery'

function App() {

  return (
    <Suspense fallback={<h1>Loading users...</h1>}>
      <UserGallery />
    </Suspense>
  )
}

// Suspense = handles loading state
// fallback = what shows while data is loading
// use() pauses rendering until data comes
// Then UserGallery shows automatically

export default App
