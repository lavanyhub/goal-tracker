'use client'
import { useState, useEffect } from 'react'
import { supabase } from './supabaseClient'

export default function Navigation() {
  const [role, setRole] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        const { data } = await supabase
          .from('users')
          .select('role')
          .eq('email', user.email)
          .single()
        if (data) setRole(data.role)
      }
      setLoading(false)
    }
    getUser()
  }, [])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    window.location.href = '/'
  }

  if (loading || !role) return null

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-bold text-lg">🎯 Goal Tracker Portal</h1>
      <div className="flex gap-4 items-center">
        {role === 'employee' && (
          <>
            <a href="/dashboard" className="opacity-90 hover:opacity-100">Dashboard</a>
            <a href="/goals" className="opacity-90 hover:opacity-100">My Goals</a>
            <a href="/achievements" className="opacity-90 hover:opacity-100">Achievements</a>
          </>
        )}
        {role === 'manager' && (
          <>
            <a href="/dashboard" className="opacity-90 hover:opacity-100">Dashboard</a>
            <a href="/approvals" className="opacity-90 hover:opacity-100">Approvals</a>
            <a href="/checkins" className="opacity-90 hover:opacity-100">Check-ins</a>
          </>
        )}
        {role === 'admin' && (
          <>
            <a href="/dashboard" className="opacity-90 hover:opacity-100">Dashboard</a>
            <a href="/approvals" className="opacity-90 hover:opacity-100">Approvals</a>
            <a href="/goals" className="opacity-90 hover:opacity-100">All Goals</a>
            <a href="/analytics" className="opacity-90 hover:opacity-100">Analytics</a>
            <a href="/audit" className="opacity-90 hover:opacity-100">Audit Trail</a>
          </>
        )}
        <span className="bg-white text-blue-600 px-2 py-1 rounded text-sm font-medium">
          {role.toUpperCase()}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}