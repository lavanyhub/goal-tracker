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

  if (loading) return null

  if (!role) return null

  return (
    <nav style={{backgroundColor: '#2563eb', color: 'white', padding: '12px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <h1 style={{fontWeight: 'bold', fontSize: '18px', margin: 0}}>🎯 Goal Tracker Portal</h1>
      <div style={{display: 'flex', gap: '24px', alignItems: 'center'}}>
        {role === 'employee' && (
          <>
            <a href="/dashboard" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>Dashboard</a>
            <a href="/goals" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>My Goals</a>
            <a href="/achievements" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>Achievements</a>
          </>
        )}
        {role === 'manager' && (
          <>
            <a href="/dashboard" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>Dashboard</a>
            <a href="/approvals" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>Approvals</a>
            <a href="/checkins" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>Check-ins</a>
          </>
        )}
        {role === 'admin' && (
          <>
            <a href="/dashboard" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>Dashboard</a>
            <a href="/approvals" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>Approvals</a>
            <a href="/goals" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>All Goals</a>
            <a href="/analytics" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>Analytics</a>
            <a href="/costs" style={{color: 'white', textDecoration: 'none', fontSize: '15px'}}>Cost Info</a>
          </>
        )}
        <span style={{backgroundColor: 'white', color: '#2563eb', padding: '4px 10px', borderRadius: '6px', fontSize: '13px', fontWeight: '600'}}>
          {role.toUpperCase()}
        </span>
        <button onClick={handleLogout} style={{backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '6px 14px', borderRadius: '6px', fontSize: '14px', cursor: 'pointer'}}>
          Logout
        </button>
      </div>
    </nav>
  )
}