'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }

      const { data: userData } = await supabase
        .from('users')
        .select('*')
        .eq('email', user.email)
        .single()

      if (userData) {
        setRole(userData.role)
        setName(userData.name)
        fetchStats(userData)
      }
    }
    getUser()
  }, [])

  const fetchStats = async (userData: any) => {
    setLoading(true)
    if (userData.role === 'admin') {
      const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact' })
      const { count: totalGoals } = await supabase.from('goals').select('*', { count: 'exact' })
      const { count: pendingGoals } = await supabase.from('goals').select('*', { count: 'exact' }).eq('status', 'pending')
      const { count: approvedGoals } = await supabase.from('goals').select('*', { count: 'exact' }).eq('status', 'approved')
      setStats({ totalUsers, totalGoals, pendingGoals, approvedGoals })
    } else if (userData.role === 'manager') {
      const { count: pendingApprovals } = await supabase.from('goals').select('*', { count: 'exact' }).eq('status', 'pending')
      const { count: totalEmployees } = await supabase.from('users').select('*', { count: 'exact' }).eq('role', 'employee')
      const { count: totalCheckins } = await supabase.from('checkins').select('*', { count: 'exact' }).eq('manager_id', userData.id)
      setStats({ pendingApprovals, totalEmployees, totalCheckins })
    } else {
      const { count: totalGoals } = await supabase.from('goals').select('*', { count: 'exact' }).eq('employee_id', userData.id)
      const { count: approvedGoals } = await supabase.from('goals').select('*', { count: 'exact' }).eq('employee_id', userData.id).eq('status', 'approved')
      const { count: pendingGoals } = await supabase.from('goals').select('*', { count: 'exact' }).eq('employee_id', userData.id).eq('status', 'pending')
      setStats({ totalGoals, approvedGoals, pendingGoals })
    }
    setLoading(false)
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">Loading dashboard...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-blue-600">Dashboard</h1>
        <p className="text-gray-500 text-sm">Welcome back, <strong>{name}</strong> 👋</p>
      </div>

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
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Admin Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-8">
        <StatCard icon="👥" label="Total Users" value={stats.totalUsers} color="blue" />
        <StatCard icon="🎯" label="Total Goals" value={stats.totalGoals} color="purple" />
        <StatCard icon="⏳" label="Pending Approval" value={stats.pendingGoals} color="yellow" />
        <StatCard icon="✅" label="Approved Goals" value={stats.approvedGoals} color="green" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <QuickLink href="/approvals" icon="✅" label="Approvals" />
        <QuickLink href="/shared-goals" icon="🔗" label="Shared Goals" />
        <QuickLink href="/completion" icon="📋" label="Completion" />
        <QuickLink href="/analytics" icon="📊" label="Analytics" />
        <QuickLink href="/audit" icon="📝" label="Audit Trail" />
      </div>
    </div>
  )
}

function ManagerDashboard({ stats }: { stats: any }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Manager Overview</h2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard icon="⏳" label="Pending Approvals" value={stats.pendingApprovals} color="yellow" />
        <StatCard icon="👥" label="Total Employees" value={stats.totalEmployees} color="blue" />
        <StatCard icon="💬" label="Check-ins Done" value={stats.totalCheckins} color="green" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <QuickLink href="/approvals" icon="✅" label="Approvals" />
        <QuickLink href="/checkins" icon="💬" label="Check-ins" />
        <QuickLink href="/completion" icon="📋" label="Completion" />
      </div>
    </div>
  )
}

function EmployeeDashboard({ stats }: { stats: any }) {
  return (
    <div>
      <h2 className="text-2xl font-bold mb-6 text-gray-800">My Overview</h2>
      <div className="grid grid-cols-3 gap-6 mb-8">
        <StatCard icon="🎯" label="Total Goals" value={stats.totalGoals} color="blue" />
        <StatCard icon="✅" label="Approved" value={stats.approvedGoals} color="green" />
        <StatCard icon="⏳" label="Pending" value={stats.pendingGoals} color="yellow" />
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        <QuickLink href="/goals" icon="🎯" label="My Goals" />
        <QuickLink href="/achievements" icon="🏆" label="Achievements" />
      </div>
    </div>
  )
}

function StatCard({ icon, label, value, color }: { icon: string, label: string, value: any, color: string }) {
  const colors: any = {
    blue: 'bg-blue-50 border-blue-200 text-blue-700',
    green: 'bg-green-50 border-green-200 text-green-700',
    yellow: 'bg-yellow-50 border-yellow-200 text-yellow-700',
    purple: 'bg-purple-50 border-purple-200 text-purple-700',
  }
  return (
    <div className={`p-6 rounded-xl border-2 ${colors[color]}`}>
      <div className="text-3xl mb-2">{icon}</div>
      <div className="text-3xl font-bold">{value ?? 0}</div>
      <div className="text-sm font-medium mt-1">{label}</div>
    </div>
  )
}

function QuickLink({ href, icon, label }: { href: string, icon: string, label: string }) {
  return (
    <a href={href} className="bg-white p-4 rounded-xl shadow hover:shadow-md transition-all flex items-center gap-3 text-gray-700 hover:text-blue-600">
      <span className="text-2xl">{icon}</span>
      <span className="font-medium">{label}</span>
      <span className="ml-auto text-gray-300">→</span>
    </a>
  )
}