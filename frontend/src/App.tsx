import { Routes, Route } from 'react-router-dom'
import RoomPage from './pages/RoomPage'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/room/:shortId" element={<RoomPage />} />
    </Routes>
  )
}

function HomePage() {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>Pair Programming</h1>
      <p>Create or join a room to start coding together</p>
    </div>
  )
}

export default App
