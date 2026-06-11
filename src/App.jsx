import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Squad from './pages/Squad'
import Matches from './pages/Matches'
import Subs from './pages/Subs'
import Table from './pages/Table'
import AdminLogin from './pages/admin/AdminLogin'
import AdminRoute from './components/AdminRoute'
import { SubsProvider } from './lib/SubsContext'

export default function App() {
  return (
    <SubsProvider>
      <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/squad" element={<Squad />} />
          <Route path="/matches" element={<Matches />} />
          <Route path="/subs" element={<Subs />} />
          <Route path="/table" element={<Table />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*" element={<AdminRoute />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </SubsProvider>
  )
}
