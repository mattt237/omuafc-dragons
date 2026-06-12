import { Routes, Route, Navigate } from 'react-router-dom'
import BottomNav from './components/BottomNav'
import Home from './pages/Home'
import Squad from './pages/Squad'
import Fixtures from './pages/Fixtures'
import MatchDay from './pages/MatchDay'
import Table from './pages/Table'
import AdminLogin from './pages/admin/AdminLogin'
import AdminRoute from './components/AdminRoute'
import { MatchDayProvider } from './lib/MatchDayContext'

export default function App() {
  return (
    <MatchDayProvider>
      <div className="flex flex-col min-h-screen bg-[#0a0a0a]">
        <Routes>
          <Route path="/"          element={<Home />} />
          <Route path="/squad"     element={<Squad />} />
          <Route path="/fixtures"  element={<Fixtures />} />
          <Route path="/matchday"  element={<MatchDay />} />
          <Route path="/table"     element={<Table />} />
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin/*"   element={<AdminRoute />} />
          {/* Legacy redirects */}
          <Route path="/matches"   element={<Navigate to="/fixtures" replace />} />
          <Route path="/subs"      element={<Navigate to="/matchday" replace />} />
          <Route path="*"          element={<Navigate to="/" replace />} />
        </Routes>
        <BottomNav />
      </div>
    </MatchDayProvider>
  )
}
