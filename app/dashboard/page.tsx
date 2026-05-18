'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [role, setRole] = useState('')
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalGoals: 0,
    pendingApprovals: 0,
    approvedGoals: 0
  })

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single()
        if (data) {
          setRole(data.role)
          fetchStats()
        }
      }
    }
    getUser()
  }, [])

  const fetchStats = async () => {
    const { count: usersCount } = await supabase
      .from('users')
      .select('*', { count: 'exact' })

    const { count: goalsCount } = await supabase
      .from('goals')
      .select('*', { count: 'exact' })

    const { count: pendingCount } = await supabase
      .from('goals')
      .select('*', { count: 'exact' })
      .eq('status', 'pending')

    const { count: approvedCount } = await supabase
      .from('goals')
      .select('*', { count: 'exact' })
      .eq('status', 'approved')

    setStats({
      totalUsers: usersCount || 0,
      totalGoals: goalsCount || 0,
      pendingApprovals: pendingCount || 0,
      approvedGoals: approvedCount || 0
    })
  }

  if (!role) return <div className="p-8">Loading...</div>

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="p-8">
        {role === 'admin' && <AdminDashboard stats={stats} />}
        {role === 'manager' && <ManagerDashboard stats={stats} />}
        {role === 'employee' && <EmployeeDashboard stats={stats} />}
      </div>
    </div>
  )
}

function AdminDashboard({ stats }: { stats: any }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Dashboard</h2>
      <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-600">Total Users</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalUsers}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-600">Total Goals</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.totalGoals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-600">Pending Approvals</h3>
          <p className="text-4xl font-bold text-orange-600 mt-2">{stats.pendingApprovals}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-600">Approved Goals</h3>
          <p className="text-4xl font-bold text-purple-600 mt-2">{stats.approvedGoals}</p>
        </div>
      </div>
    </div>
  )
}

function ManagerDashboard({ stats }: { stats: any }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manager Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-600">Pending Approvals</h3>
          <p className="text-4xl font-bold text-orange-600 mt-2">{stats.pendingApprovals}</p>
          <a href="/approvals" className="text-blue-600 text-sm mt-3 block hover:underline">
            View Approvals →
          </a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-600">Approved Goals</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.approvedGoals}</p>
        </div>
      </div>
    </div>
  )
}

function EmployeeDashboard({ stats }: { stats: any }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Employee Dashboard</h2>
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-600">My Total Goals</h3>
          <p className="text-4xl font-bold text-blue-600 mt-2">{stats.totalGoals}</p>
          <a href="/goals" className="text-blue-600 text-sm mt-3 block hover:underline">
            View My Goals →
          </a>
        </div>
        <div className="bg-white p-6 rounded-lg shadow text-center">
          <h3 className="text-sm font-medium text-gray-600">Approved Goals</h3>
          <p className="text-4xl font-bold text-green-600 mt-2">{stats.approvedGoals}</p>
        </div>
      </div>
    </div>
  )
}