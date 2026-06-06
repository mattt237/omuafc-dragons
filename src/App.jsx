import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Squad from './pages/Squad'
import Matches from './pages/Matches'
import About from './pages/About'
import Table from './pages/Table'
import AdminLogin from './pages/admin/AdminLogin'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminRoute from './components/AdminRoute'

export default function App() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/squad" element={<Squad />} />
        <Route path="/matches" element={<Matches />} />
        <Route path="/about" element={<About />} />
        <Route path="/table" element={<Table />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin/*" element={<AdminRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <BottomNav />
    </div>
  )
}
