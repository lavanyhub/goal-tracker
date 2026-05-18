'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Dashboard() {
  const [role, setRole] = useState('')
  const [name, setName] = useState('')
  const [stats, setStats] = useState<any>({})
  const [loading, setLoading] = useState(true)
  const [time, setTime] = useState('')

  useEffect(() => {
    const timer = setInterval(() => {
      setTime(new Date().toLocaleTimeString('en-US', { hour12: false }))
    }, 1000)
    return () => clearInterval(timer)
  }, [])

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { window.location.href = '/'; return }
      const { data: userData } = await supabase
        .from('users').select('*').eq('email', user.email).single()
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
    const { count: totalUsers } = await supabase.from('users').select('*', { count: 'exact' })
    const { count: totalGoals } = await supabase.from('goals').select('*', { count: 'exact' })
    const { count: pendingGoals } = await supabase.from('goals').select('*', { count: 'exact' }).eq('status', 'pending')
    const { count: approvedGoals } = await supabase.from('goals').select('*', { count: 'exact' }).eq('status', 'approved')
    const { count: totalCheckins } = await supabase.from('checkins').select('*', { count: 'exact' })
    const { data: recentGoals } = await supabase.from('goals').select('*, users(name)').order('created_at', { ascending: false }).limit(5)
    setStats({ totalUsers, totalGoals, pendingGoals, approvedGoals, totalCheckins, recentGoals: recentGoals || [] })
    setLoading(false)
  }

  if (loading) return (
    <div style={{ minHeight:'100vh', background:'#0a0e1a', display:'flex', alignItems:'center', justifyContent:'center' }}>
      <div style={{ textAlign:'center' }}>
        <div style={{ width:'48px', height:'48px', border:'3px solid #00d4ff', borderTopColor:'transparent', borderRadius:'50%', animation:'spin 1s linear infinite', margin:'0 auto 16px' }}></div>
        <p style={{ color:'#00d4ff', fontFamily:'monospace' }}>LOADING SYSTEM...</p>
      </div>
    </div>
  )

  const statCards = role === 'admin' ? [
    { label:'TOTAL USERS', value: stats.totalUsers || 0, icon:'👥', color:'#00d4ff', sub:'Active accounts' },
    { label:'TOTAL GOALS', value: stats.totalGoals || 0, icon:'🎯', color:'#7c3aed', sub:'This cycle' },
    { label:'PENDING', value: stats.pendingGoals || 0, icon:'⏳', color:'#f59e0b', sub:'Awaiting review' },
    { label:'APPROVED', value: stats.approvedGoals || 0, icon:'✅', color:'#10b981', sub:'Goals locked' },
  ] : role === 'manager' ? [
    { label:'PENDING APPROVALS', value: stats.pendingGoals || 0, icon:'⏳', color:'#f59e0b', sub:'Awaiting review' },
    { label:'APPROVED GOALS', value: stats.approvedGoals || 0, icon:'✅', color:'#10b981', sub:'Goals locked' },
    { label:'CHECK-INS DONE', value: stats.totalCheckins || 0, icon:'💬', color:'#00d4ff', sub:'This quarter' },
  ] : [
    { label:'MY GOALS', value: stats.totalGoals || 0, icon:'🎯', color:'#00d4ff', sub:'This cycle' },
    { label:'APPROVED', value: stats.approvedGoals || 0, icon:'✅', color:'#10b981', sub:'Goals locked' },
    { label:'PENDING', value: stats.pendingGoals || 0, icon:'⏳', color:'#f59e0b', sub:'Awaiting review' },
  ]

  const quickLinks = role === 'admin' ? [
    { href:'/approvals', icon:'✅', label:'Approvals' },
    { href:'/shared-goals', icon:'🔗', label:'Shared Goals' },
    { href:'/completion', icon:'📋', label:'Completion' },
    { href:'/analytics', icon:'📊', label:'Analytics' },
    { href:'/escalation', icon:'🚨', label:'Escalations' },
    { href:'/audit', icon:'📝', label:'Audit Trail' },
  ] : role === 'manager' ? [
    { href:'/approvals', icon:'✅', label:'Approvals' },
    { href:'/checkins', icon:'💬', label:'Check-ins' },
    { href:'/completion', icon:'📋', label:'Completion' },
  ] : [
    { href:'/goals', icon:'🎯', label:'My Goals' },
    { href:'/achievements', icon:'🏆', label:'Achievements' },
  ]

  return (
    <div style={{ minHeight:'100vh', background:'#0a0e1a', fontFamily:'Inter, monospace', color:'white' }}>

      {/* Top Bar */}
      <div style={{
        background:'rgba(0,212,255,0.05)',
        borderBottom:'1px solid rgba(0,212,255,0.2)',
        padding:'12px 32px',
        display:'flex', justifyContent:'space-between', alignItems:'center'
      }}>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ color:'#00d4ff', fontFamily:'monospace', fontWeight:'800', fontSize:'18px', letterSpacing:'3px' }}>
            GOALTRACK OS
          </span>
          <span style={{ width:'8px', height:'8px', borderRadius:'50%', background:'#10b981', display:'inline-block', boxShadow:'0 0 8px #10b981' }}></span>
          <span style={{ color:'#64748b', fontFamily:'monospace', fontSize:'14px' }}>{time} UTC</span>
        </div>
        <div style={{ display:'flex', alignItems:'center', gap:'12px' }}>
          <span style={{ color:'#94a3b8', fontSize:'14px' }}>{name.toUpperCase()}</span>
          <div style={{
            width:'36px', height:'36px', borderRadius:'50%',
            background:'linear-gradient(135deg, #7c3aed, #00d4ff)',
            display:'flex', alignItems:'center', justifyContent:'center',
            fontWeight:'700', fontSize:'14px'
          }}>
            {name.charAt(0).toUpperCase()}
          </div>
        </div>
      </div>

      <div style={{ padding:'32px' }}>

        {/* Welcome */}
        <div style={{ marginBottom:'32px' }}>
          <h1 style={{ fontSize:'28px', fontWeight:'800', color:'white', marginBottom:'4px' }}>
            Welcome back, <span style={{ color:'#00d4ff' }}>{name}</span> 👋
          </h1>
          <p style={{ color:'#64748b', fontFamily:'monospace' }}>
            {role.toUpperCase()} DASHBOARD — Q1 2026
          </p>
        </div>

        {/* Stat Cards */}
        <div style={{ display:'grid', gridTemplateColumns:`repeat(${statCards.length}, 1fr)`, gap:'20px', marginBottom:'32px' }}>
          {statCards.map((card, i) => (
            <div key={i} style={{
              background:'rgba(255,255,255,0.03)',
              border:`1px solid ${card.color}33`,
              borderRadius:'16px', padding:'24px',
              position:'relative', overflow:'hidden',
              transition:'transform 0.2s',
            }}
            onMouseEnter={e => (e.currentTarget.style.transform = 'translateY(-4px)')}
            onMouseLeave={e => (e.currentTarget.style.transform = 'translateY(0)')}
            >
              <div style={{ position:'absolute', top:0, left:0, right:0, height:'2px', background:`linear-gradient(90deg, transparent, ${card.color}, transparent)` }}></div>
              <div style={{ fontSize:'28px', marginBottom:'12px' }}>{card.icon}</div>
              <div style={{ fontSize:'42px', fontWeight:'900', color:card.color, fontFamily:'monospace', marginBottom:'4px' }}>
                {String(card.value).padStart(2, '0')}
              </div>
              <div style={{ fontSize:'11px', color:'#64748b', letterSpacing:'2px', fontFamily:'monospace' }}>{card.label}</div>
              <div style={{ fontSize:'12px', color:'#94a3b8', marginTop:'4px' }}>{card.sub}</div>
            </div>
          ))}
        </div>

        {/* Quick Links + Recent Activity */}
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'24px' }}>

          {/* Quick Links */}
          <div style={{
            background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(0,212,255,0.15)',
            borderRadius:'16px', padding:'24px'
          }}>
            <h2 style={{ color:'#00d4ff', fontFamily:'monospace', fontSize:'13px', letterSpacing:'2px', marginBottom:'20px' }}>
              ⚡ QUICK ACCESS
            </h2>
            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px' }}>
              {quickLinks.map((link, i) => (
                <a key={i} href={link.href} style={{
                  background:'rgba(0,212,255,0.05)',
                  border:'1px solid rgba(0,212,255,0.15)',
                  borderRadius:'12px', padding:'16px',
                  display:'flex', alignItems:'center', gap:'12px',
                  color:'white', textDecoration:'none',
                  transition:'all 0.2s',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.background = 'rgba(0,212,255,0.1)'
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.4)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.background = 'rgba(0,212,255,0.05)'
                  e.currentTarget.style.borderColor = 'rgba(0,212,255,0.15)'
                }}
                >
                  <span style={{ fontSize:'22px' }}>{link.icon}</span>
                  <span style={{ fontSize:'13px', fontWeight:'600' }}>{link.label}</span>
                </a>
              ))}
            </div>
          </div>

          {/* Recent Activity */}
          <div style={{
            background:'rgba(255,255,255,0.03)',
            border:'1px solid rgba(124,58,237,0.3)',
            borderRadius:'16px', padding:'24px'
          }}>
            <h2 style={{ color:'#7c3aed', fontFamily:'monospace', fontSize:'13px', letterSpacing:'2px', marginBottom:'20px' }}>
              🔔 SYSTEM ALERTS
            </h2>
            {stats.recentGoals?.length === 0 ? (
              <p style={{ color:'#64748b', fontSize:'14px' }}>No recent activity</p>
            ) : (
              stats.recentGoals?.map((goal: any, i: number) => (
                <div key={i} style={{
                  display:'flex', alignItems:'flex-start', gap:'12px',
                  padding:'12px 0',
                  borderBottom: i < stats.recentGoals.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none'
                }}>
                  <span style={{
                    width:'8px', height:'8px', borderRadius:'50%', marginTop:'6px', flexShrink:0,
                    background: goal.status === 'approved' ? '#10b981' : goal.status === 'pending' ? '#f59e0b' : '#64748b',
                    boxShadow: goal.status === 'approved' ? '0 0 8px #10b981' : goal.status === 'pending' ? '0 0 8px #f59e0b' : 'none'
                  }}></span>
                  <div>
                    <p style={{ color:'white', fontSize:'13px', fontWeight:'600', marginBottom:'2px' }}>{goal.title}</p>
                    <p style={{ color:'#64748b', fontSize:'11px', fontFamily:'monospace' }}>
                      {goal.status.toUpperCase()} — {goal.thrust_area || 'General'}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>

        </div>
      </div>

      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  )
}