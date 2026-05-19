'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function AdminPanel() {
  const [goals, setGoals] = useState<any[]>([])
  const [cycles, setCycles] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    fetchGoals()
    fetchCycles()
  }, [])

  const showToast = (msg: string, type: string = 'success') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const fetchGoals = async () => {
    const { data } = await supabase
      .from('goals')
      .select('*, users(name, email)')
      .eq('locked', true)
      .order('created_at', { ascending: false })
    setGoals(data || [])
  }

  const fetchCycles = async () => {
    const { data } = await supabase
      .from('cycles')
      .select('*')
      .order('created_at', { ascending: false })
    setCycles(data || [])
  }

  const handleUnlock = async (goalId: any) => {
    await supabase
      .from('goals')
      .update({ locked: false, status: 'draft' })
      .eq('id', goalId)
    showToast('Goal unlocked successfully!')
    fetchGoals()
  }

  const handleOpenCycle = async () => {
    await supabase
      .from('cycles')
      .update({ is_active: false })
      .eq('is_active', true)

    await supabase.from('cycles').insert({
      name: `Q${Math.ceil((new Date().getMonth() + 1) / 3)} ${new Date().getFullYear()}`,
      phase: 'GOAL_SETTING',
      is_active: true,
      opened_at: new Date().toISOString()
    })
    showToast('New cycle opened!')
    fetchCycles()
  }

  const handleCloseCycle = async (cycleId: any) => {
    await supabase
      .from('cycles')
      .update({ is_active: false, closed_at: new Date().toISOString() })
      .eq('id', cycleId)
    showToast('Cycle closed!')
    fetchCycles()
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '32px'}}>
      {message && (
        <div style={{position: 'fixed', top: '20px', right: '20px', zIndex: 999, padding: '12px 20px', borderRadius: '8px', color: 'white', fontWeight: '500', backgroundColor: messageType === 'success' ? '#22c55e' : '#ef4444'}}>
          {message}
        </div>
      )}

      <div style={{maxWidth: '1100px', margin: '0 auto'}}>
        <h1 style={{fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px'}}>Admin Panel</h1>
        <p style={{fontSize: '14px', color: '#64748b', marginBottom: '32px'}}>Cycle management and goal unlock capabilities</p>

        {/* Cycle Management */}
        <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e2e8f0'}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
            <h2 style={{fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: 0}}>Cycle Management</h2>
            <button
              onClick={handleOpenCycle}
              style={{backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>
              + Open New Cycle
            </button>
          </div>

          {cycles.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No cycles yet</div>
          ) : (
            <div style={{display: 'grid', gap: '12px'}}>
              {cycles.map(cycle => (
                <div key={cycle.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: cycle.is_active ? '#f0fdf4' : '#f8fafc', borderRadius: '8px', border: `1px solid ${cycle.is_active ? '#22c55e' : '#e2e8f0'}`}}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px'}}>
                      <h3 style={{fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: 0}}>{cycle.name}</h3>
                      <span style={{fontSize: '12px', fontWeight: '600', padding: '2px 10px', borderRadius: '20px', backgroundColor: cycle.is_active ? '#dcfce7' : '#f1f5f9', color: cycle.is_active ? '#16a34a' : '#64748b'}}>
                        {cycle.is_active ? 'ACTIVE' : 'CLOSED'}
                      </span>
                    </div>
                    <p style={{fontSize: '13px', color: '#64748b', margin: '4px 0 0 0'}}>
                      Phase: {cycle.phase} | Opened: {new Date(cycle.opened_at).toLocaleDateString()}
                      {cycle.closed_at && ` | Closed: ${new Date(cycle.closed_at).toLocaleDateString()}`}
                    </p>
                  </div>
                  {cycle.is_active && (
                    <button
                      onClick={() => handleCloseCycle(cycle.id)}
                      style={{backgroundColor: '#ef4444', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'}}>
                      Close Cycle
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Goal Unlock */}
        <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
          <h2 style={{fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px'}}>Goal Unlock</h2>
          <p style={{fontSize: '13px', color: '#64748b', marginBottom: '16px'}}>Unlock approved/locked goals to allow employees to make changes</p>

          {goals.length === 0 ? (
            <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No locked goals found</div>
          ) : (
            <div style={{display: 'grid', gap: '12px'}}>
              {goals.map(goal => (
                <div key={goal.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', border: '1px solid #e2e8f0'}}>
                  <div>
                    <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px'}}>
                      <span style={{fontSize: '12px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '20px'}}>{goal.thrust_area || 'General'}</span>
                      <span style={{fontSize: '12px', backgroundColor: '#fef2f2', color: '#ef4444', padding: '2px 8px', borderRadius: '20px', fontWeight: '600'}}>🔒 LOCKED</span>
                    </div>
                    <h3 style={{fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px 0'}}>{goal.title}</h3>
                    <p style={{fontSize: '13px', color: '#64748b', margin: 0}}>
                      {goal.users?.name} | Target: {goal.target} | Weightage: {goal.weightage}%
                    </p>
                  </div>
                  <button
                    onClick={() => handleUnlock(goal.id)}
                    style={{backgroundColor: '#f59e0b', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer'}}>
                    🔓 Unlock
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}