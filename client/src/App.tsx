import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<div className="p-8"><h1 className="text-2xl font-bold">VetClinic Pro - Dashboard</h1><p className="text-muted-foreground mt-2">Setup complete! Start building features.</p></div>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App