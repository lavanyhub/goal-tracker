'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Escalation() {
  const [escalations, setEscalations] = useState<any[]>([])

  useEffect(() => {
    fetchEscalations()
  }, [])

  const fetchEscalations = async () => {
    const { data: goals } = await supabase.from('goals').select('*, users(name, email)').eq('status', 'draft')
    const { data: pending } = await supabase.from('goals').select('*, users(name, email)').eq('status', 'pending')
    const list: any[] = []
    const now = new Date()
    goals?.forEach(g => {
      const days = Math.floor((now.getTime() - new Date(g.created_at).getTime()) / 86400000)
      if (days > 3) list.push({ ...g, issue: 'Goal Not Submitted', details: 'Employee has goals in draft but not submitted for approval', days, severity: days > 7 ? 'HIGH' : 'MEDIUM' })
    })
    pending?.forEach(g => {
      const days = Math.floor((now.getTime() - new Date(g.created_at).getTime()) / 86400000)
      if (days > 3) list.push({ ...g, issue: 'Approval Pending', details: 'Manager has not approved goals submitted by employee', days, severity: days > 7 ? 'HIGH' : 'MEDIUM' })
    })
    setEscalations(list)
  }

  const high = escalations.filter(e => e.severity === 'HIGH').length
  const medium = escalations.filter(e => e.severity === 'MEDIUM').length

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '32px'}}>
      <div style={{maxWidth: '1100px', margin: '0 auto'}}>
        <h1 style={{fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px'}}>Escalation Module</h1>
        <p style={{fontSize: '14px', color: '#64748b', marginBottom: '32px'}}>Rule-based alerts for overdue actions</p>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '16px', marginBottom: '24px'}}>
          <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #fecaca', textAlign: 'center'}}>
            <div style={{fontSize: '32px', fontWeight: '800', color: '#ef4444'}}>{high}</div>
            <div style={{fontSize: '13px', color: '#64748b', marginTop: '4px'}}>High Severity</div>
          </div>
          <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #fed7aa', textAlign: 'center'}}>
            <div style={{fontSize: '32px', fontWeight: '800', color: '#f97316'}}>{medium}</div>
            <div style={{fontSize: '13px', color: '#64748b', marginTop: '4px'}}>Medium Severity</div>
          </div>
          <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '20px', border: '1px solid #e2e8f0', textAlign: 'center'}}>
            <div style={{fontSize: '32px', fontWeight: '800', color: '#1e293b'}}>{escalations.length}</div>
            <div style={{fontSize: '13px', color: '#64748b', marginTop: '4px'}}>Total Open</div>
          </div>
        </div>

        <div style={{backgroundColor: 'white', borderRadius: '12px', border: '1px solid #e2e8f0', overflow: 'hidden'}}>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 2fr 3fr 1fr 1fr 1fr', padding: '12px 20px', backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0'}}>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Employee</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Issue</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Details</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Days</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Severity</span>
            <span style={{fontSize: '13px', fontWeight: '600', color: '#475569'}}>Status</span>
          </div>
          {escalations.length === 0 ? (
            <div style={{padding: '40px', textAlign: 'center', color: '#94a3b8'}}>No escalations! Everything is on track.</div>
          ) : (
            escalations.map((e, i) => (
              <div key={i} style={{display: 'grid', gridTemplateColumns: '2fr 2fr 3fr 1fr 1fr 1fr', padding: '16px 20px', borderBottom: '1px solid #f1f5f9', alignItems: 'center'}}>
                <div>
                  <p style={{fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0}}>{e.users?.name}</p>
                  <p style={{fontSize: '12px', color: '#64748b', margin: 0}}>{e.users?.email}</p>
                </div>
                <span style={{fontSize: '13px', color: '#1e293b'}}>{e.issue}</span>
                <span style={{fontSize: '13px', color: '#64748b'}}>{e.details}</span>
                <span style={{fontSize: '13px', fontWeight: '600', color: '#1e293b'}}>{e.days}d</span>
                <span style={{fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', backgroundColor: e.severity === 'HIGH' ? '#fef2f2' : '#fff7ed', color: e.severity === 'HIGH' ? '#ef4444' : '#f97316'}}>{e.severity}</span>
                <span style={{fontSize: '12px', fontWeight: '600', padding: '3px 10px', borderRadius: '20px', backgroundColor: '#f0fdf4', color: '#16a34a'}}>OPEN</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}