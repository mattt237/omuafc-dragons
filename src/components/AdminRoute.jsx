import { Navigate, Routes, Route } from 'react-router-dom'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminMatches from '../pages/admin/AdminMatches'
import AdminPlayers from '../pages/admin/AdminPlayers'
import AdminTraining from '../pages/admin/AdminTraining'
import AdminTable from '../pages/admin/AdminTable'

export default function AdminRoute() {
  const isAuth = sessionStorage.getItem('admin_auth') === 'true'
  if (!isAuth) return <Navigate to="/admin/login" replace />

  return (
    <Routes>
      <Route index element={<AdminDashboard />} />
      <Route path="matches" element={<AdminMatches />} />
      <Route path="players" element={<AdminPlayers />} />
      <Route path="training" element={<AdminTraining />} />
      <Route path="table" element={<AdminTable />} />
    </Routes>
  )
}
