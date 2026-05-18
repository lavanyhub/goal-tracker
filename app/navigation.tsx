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
    window.location.reload()
  }

  if (loading || !role) return null

  return (
    <nav className="bg-blue-600 text-white px-6 py-3 flex justify-between items-center">
      <h1 className="font-bold text-lg">🎯 Goal Tracker Portal</h1>
      <div className="flex gap-4 items-center">
        {role === 'employee' && (
          <>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/goals" className="hover:underline">My Goals</a>
            <a href="/achievements" className="hover:underline">Achievements</a>
          </>
        )}
        {role === 'manager' && (
          <>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/approvals" className="hover:underline">Approvals</a>
            <a href="/checkins" className="hover:underline">Check-ins</a>
          </>
        )}
        {role === 'admin' && (
          <>
            <a href="/dashboard" className="hover:underline">Dashboard</a>
            <a href="/approvals" className="hover:underline">Approvals</a>
            <a href="/goals" className="hover:underline">All Goals</a>
            <a href="/audit" className="hover:underline">Audit Trail</a>
            <a href="/analytics" className="hover:underline">Analytics</a>
          </>
        )}
        <span className="bg-white text-blue-600 px-2 py-1 rounded text-sm font-medium">
          {role.toUpperCase()}
        </span>
        <button
          onClick={handleLogout}
          className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 text-sm"
        >
          Logout
        </button>
      </div>
    </nav>
  )
}