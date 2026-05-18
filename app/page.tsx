'use client'
import { useState } from 'react'
import { supabase } from './supabaseClient'

export default function Home() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)

  const handleLogin = async () => {
    if (!email || !password) {
      setMessage('Please enter both email and password!')
      return
    }
    setLoading(true)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setMessage('Wrong email or password!')
      setLoading(false)
    } else {
      window.location.href = '/dashboard'
    }
  }

  return (
    <div style={{minHeight:'100vh', display:'flex', fontFamily:'Inter, sans-serif'}}>
      {/* Left Panel */}
      <div style={{
        width:'50%',
        background:'linear-gradient(135deg, #1e3a5f 0%, #0f2027 50%, #0a0e1a 100%)',
        display:'flex',
        flexDirection:'column',
        justifyContent:'center',
        alignItems:'center',
        padding:'48px',
        color:'white'
      }}>
        <div style={{textAlign:'center', maxWidth:'400px'}}>
          <div style={{fontSize:'72px', marginBottom:'24px'}}>🎯</div>
          <h1 style={{fontSize:'36px', fontWeight:'800', marginBottom:'12px', background:'linear-gradient(90deg, #00d4ff, #7c3aed)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent'}}>
            Goal Tracker Portal
          </h1>
          <p style={{color:'#94a3b8', fontSize:'18px', marginBottom:'40px'}}>
            Align. Track. Achieve.
          </p>
          {[
            {icon:'📋', title:'Set Goals', desc:'Create and align goals with org objectives'},
            {icon:'✅', title:'Track Progress', desc:'Monitor achievements with real-time dashboards'},
            {icon:'📊', title:'Analytics', desc:'Gain insights with powerful reporting tools'},
          ].map((item, i) => (
            <div key={i} style={{
              display:'flex', alignItems:'center', gap:'16px',
              background:'rgba(255,255,255,0.05)',
              border:'1px solid rgba(0,212,255,0.2)',
              borderRadius:'12px', padding:'16px', marginBottom:'12px',
              textAlign:'left'
            }}>
              <span style={{fontSize:'28px'}}>{item.icon}</span>
              <div>
                <p style={{fontWeight:'600', marginBottom:'4px'}}>{item.title}</p>
                <p style={{color:'#94a3b8', fontSize:'13px'}}>{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Right Panel */}
      <div style={{
        width:'50%',
        background:'#f8fafc',
        display:'flex',
        alignItems:'center',
        justifyContent:'center',
        padding:'48px'
      }}>
        <div style={{width:'100%', maxWidth:'420px'}}>
          <div style={{textAlign:'center', marginBottom:'32px'}}>
            <div style={{fontSize:'48px', marginBottom:'12px'}}>🎯</div>
            <h2 style={{fontSize:'28px', fontWeight:'800', color:'#1e293b', marginBottom:'8px'}}>Welcome Back</h2>
            <p style={{color:'#64748b'}}>Sign in to your Goal Tracker account</p>
          </div>

          <div style={{
            background:'white',
            borderRadius:'16px',
            padding:'32px',
            boxShadow:'0 4px 24px rgba(0,0,0,0.08)'
          }}>
            <div style={{marginBottom:'20px'}}>
              <label style={{display:'block', fontSize:'14px', fontWeight:'600', color:'#374151', marginBottom:'6px'}}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="you@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={{
                  width:'100%', border:'2px solid #e5e7eb',
                  borderRadius:'8px', padding:'12px',
                  fontSize:'14px', outline:'none',
                  boxSizing:'border-box'
                }}
              />
            </div>

            <div style={{marginBottom:'24px'}}>
              <label style={{display:'block', fontSize:'14px', fontWeight:'600', color:'#374151', marginBottom:'6px'}}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleLogin()}
                style={{
                  width:'100%', border:'2px solid #e5e7eb',
                  borderRadius:'8px', padding:'12px',
                  fontSize:'14px', outline:'none',
                  boxSizing:'border-box'
                }}
              />
            </div>

            {message && (
              <div style={{
                background:'#fef2f2', color:'#dc2626',
                padding:'12px', borderRadius:'8px',
                marginBottom:'16px', fontSize:'14px'
              }}>
                ⚠️ {message}
              </div>
            )}

            <button
              onClick={handleLogin}
              disabled={loading}
              style={{
                width:'100%', background:'linear-gradient(135deg, #2563eb, #7c3aed)',
                color:'white', padding:'14px', borderRadius:'8px',
                fontWeight:'700', fontSize:'16px', border:'none',
                opacity: loading ? 0.7 : 1
              }}
            >
              {loading ? '⏳ Signing in...' : 'Sign In →'}
            </button>

            <div style={{marginTop:'24px', paddingTop:'24px', borderTop:'1px solid #f1f5f9'}}>
              <p style={{fontSize:'12px', color:'#9ca3af', textAlign:'center', marginBottom:'12px'}}>
                Demo Accounts
              </p>
              <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:'8px'}}>
                {[
                  {label:'👑 Admin', email:'lavanysharma2023@gmail.com', pass:'Admin@123', bg:'#f5f3ff', color:'#7c3aed'},
                  {label:'👔 Manager', email:'manager@test.com', pass:'Manager@123', bg:'#eff6ff', color:'#2563eb'},
                  {label:'👤 Employee', email:'employee@test.com', pass:'Employee@123', bg:'#f0fdf4', color:'#16a34a'},
                ].map((acc, i) => (
                  <button
                    key={i}
                    onClick={() => { setEmail(acc.email); setPassword(acc.pass) }}
                    style={{
                      background:acc.bg, color:acc.color,
                      border:'none', borderRadius:'8px',
                      padding:'10px 6px', fontSize:'12px',
                      fontWeight:'600'
                    }}
                  >
                    {acc.label}
                  </button>
                ))}
              </div>
              <p style={{fontSize:'11px', color:'#9ca3af', textAlign:'center', marginTop:'8px'}}>
                Click to auto-fill credentials
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}