'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

const getActivePhase = () => {
  const month = new Date().getMonth() + 1
  if (month === 5) return 'GOAL_SETTING'
  if (month >= 7 && month <= 9) return 'Q1_CHECKIN'
  if (month >= 10 && month <= 12) return 'Q2_CHECKIN'
  if (month >= 1 && month <= 3) return 'Q3_CHECKIN'
  if (month >= 3 && month <= 4) return 'Q4_ANNUAL'
  return 'CLOSED'
}

export default function Goals() {
  const [goals, setGoals] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [showForm, setShowForm] = useState(false)
  const [thrustArea, setThrustArea] = useState('')
  const [uom, setUom] = useState('Numeric')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState('')
  const [weightage, setWeightage] = useState('')
  const [message, setMessage] = useState('')
  const phase = getActivePhase()
  const [messageType, setMessageType] = useState('info')

  const showToast = (msg: string, type: string = 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setUser(user)
        fetchGoals(user.email)
      }
    }
    getUser()
  }, [])

  const fetchGoals = async (email: any) => {
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', email)
      .single()
    if (userData) {
      const { data } = await supabase
        .from('goals')
        .select('*')
        .eq('employee_id', userData.id)
      setGoals(data || [])
    }
  }

  const totalWeightage = goals.reduce((sum, g) => sum + g.weightage, 0)

  const handleSubmitAll = async () => {
    if (totalWeightage !== 100) {
      showToast(`Total weightage must be exactly 100%! Currently: ${totalWeightage}%`, 'error')
      return
    }
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()
    await supabase
      .from('goals')
      .update({ status: 'pending' })
      .eq('employee_id', userData.id)
      .eq('status', 'draft')
    showToast('Goals submitted for approval!', 'success')
    fetchGoals(user.email)
  }

  const handleAddGoal = async () => {
    if (!title || !target || !weightage) {
      showToast('Please fill in all fields!', 'error')
      return
    }
    if (Number(weightage) < 10) {
      showToast('Minimum weightage is 10%!', 'error')
      return
    }
    if (goals.length >= 8) {
      showToast('Maximum 8 goals allowed!', 'error')
      return
    }
    if (totalWeightage + Number(weightage) > 100) {
      showToast('Total weightage cannot exceed 100%!', 'error')
      return
    }
    const { data: userData } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()
    const { error } = await supabase.from('goals').insert({
      employee_id: userData.id,
      thrust_area: thrustArea,
      uom_type: uom,
      title,
      description,
      target: Number(target),
      weightage: Number(weightage),
      status: 'draft',
      locked: false,
      quarter: 'Q1'
    })
    if (error) {
      showToast('Error adding goal!', 'error')
    } else {
      showToast('Goal added successfully!', 'success')
      setTitle('')
      setDescription('')
      setTarget('')
      setWeightage('')
      setShowForm(false)
      fetchGoals(user.email)
    }
  }

  const getRagColor = (weightage: number, status: string) => {
    if (status === 'approved') return { bg: '#f0fdf4', border: '#22c55e', badge: '#22c55e', text: 'APPROVED' }
    if (status === 'pending') return { bg: '#fffbeb', border: '#f59e0b', badge: '#f59e0b', text: 'PENDING' }
    return { bg: '#f8fafc', border: '#cbd5e1', badge: '#64748b', text: 'DRAFT' }
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f1f5f9'}}>

      {message && (
        <div style={{
          position: 'fixed', top: '20px', right: '20px', zIndex: 999,
          padding: '12px 20px', borderRadius: '8px', color: 'white',
          fontWeight: '500', fontSize: '14px',
          backgroundColor: messageType === 'success' ? '#22c55e' : messageType === 'error' ? '#ef4444' : '#3b82f6'
        }}>
          {message}
        </div>
      )}

      {/* Header */}
      <div style={{backgroundColor: 'white', padding: '16px 32px', borderBottom: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
        <div>
          <h1 style={{fontSize: '22px', fontWeight: '700', color: '#1e293b', margin: 0}}>My Goals</h1>
          <p style={{fontSize: '13px', color: '#64748b', margin: '2px 0 0 0'}}>Q1 2026 — Goal Setting Phase</p>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
          <div style={{backgroundColor: '#f1f5f9', padding: '8px 16px', borderRadius: '8px', fontSize: '14px', color: '#475569'}}>
            Weightage: <strong style={{color: totalWeightage === 100 ? '#22c55e' : '#1e293b'}}>{totalWeightage}%</strong> / 100%
          </div>
          <button
            onClick={handleSubmitAll}
            style={{backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}
          >
            Submit for Approval
          </button>
          {phase === 'GOAL_SETTING' ? (
            <button
              onClick={() => setShowForm(!showForm)}
              style={{backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}
            >
              + Add Goal
            </button>
          ) : (
            <span style={{backgroundColor: '#fef2f2', color: '#ef4444', padding: '8px 16px', borderRadius: '8px', fontSize: '13px', fontWeight: '600'}}>
              🔒 Goal setting closed — Current phase: {phase}
            </span>
          )}
        </div>
      </div>

      <div style={{padding: '32px'}}>

        {/* Add Goal Form */}
        {showForm && (
          <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '24px', marginBottom: '24px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
            <h2 style={{fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px'}}>Add New Goal</h2>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px'}}>
              <select value={thrustArea} onChange={(e) => setThrustArea(e.target.value)}
                style={{padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc'}}>
                <option value="">Select Thrust Area</option>
                <option value="Revenue Growth">Revenue Growth</option>
                <option value="Customer Success">Customer Success</option>
                <option value="Operational Excellence">Operational Excellence</option>
                <option value="People Development">People Development</option>
                <option value="Innovation">Innovation</option>
              </select>
              <select value={uom} onChange={(e) => setUom(e.target.value)}
                style={{padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc'}}>
                <option value="Numeric">Numeric</option>
                <option value="%">Percentage (%)</option>
                <option value="Timeline">Timeline</option>
                <option value="Zero-based">Zero-based</option>
              </select>
            </div>
            <input type="text" placeholder="Goal Title" value={title} onChange={(e) => setTitle(e.target.value)}
              style={{width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc', marginBottom: '12px', boxSizing: 'border-box'}}/>
            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
              style={{width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc', marginBottom: '12px', boxSizing: 'border-box', height: '80px', resize: 'none'}}/>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px'}}>
              <input type="number" placeholder="Target Value" value={target} onChange={(e) => setTarget(e.target.value)}
                style={{padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc'}}/>
              <input type="number" placeholder="Weightage % (min 10%)" value={weightage} onChange={(e) => setWeightage(e.target.value)}
                style={{padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc'}}/>
            </div>
            <div style={{display: 'flex', gap: '12px'}}>
              <button onClick={handleAddGoal}
                style={{backgroundColor: '#22c55e', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>
                Save Goal
              </button>
              <button onClick={() => setShowForm(false)}
                style={{backgroundColor: '#f1f5f9', color: '#64748b', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Goals List */}
        {goals.length === 0 ? (
          <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '60px', textAlign: 'center', border: '1px solid #e2e8f0'}}>
            <div style={{fontSize: '40px', marginBottom: '12px'}}>🎯</div>
            <h3 style={{fontSize: '18px', fontWeight: '600', color: '#1e293b', marginBottom: '8px'}}>No Goals Yet</h3>
            <p style={{fontSize: '14px', color: '#64748b', marginBottom: '20px'}}>Start by adding your first goal for this quarter!</p>
            <button onClick={() => setShowForm(true)}
              style={{backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '10px 24px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer'}}>
              + Add Your First Goal
            </button>
          </div>
        ) : (
          <div style={{display: 'grid', gap: '16px'}}>
            {goals.map((goal) => {
              const rag = getRagColor(goal.weightage, goal.status)
              return (
                <div key={goal.id} style={{backgroundColor: 'white', borderRadius: '12px', padding: '20px 24px', border: `1px solid ${rag.border}`, boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div style={{flex: 1}}>
                      <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px'}}>
                        <span style={{backgroundColor: '#f1f5f9', color: '#475569', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '500'}}>
                          {goal.thrust_area || 'General'}
                        </span>
                        <span style={{backgroundColor: rag.badge, color: 'white', padding: '3px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: '600'}}>
                          {rag.text}
                        </span>
                      </div>
                      <h3 style={{fontSize: '16px', fontWeight: '600', color: '#1e293b', margin: '0 0 4px 0'}}>{goal.title}</h3>
                      {goal.description && <p style={{fontSize: '13px', color: '#64748b', margin: '0 0 8px 0'}}>{goal.description}</p>}
                      <div style={{display: 'flex', gap: '16px', fontSize: '13px', color: '#64748b'}}>
                        <span>Target: <strong style={{color: '#1e293b'}}>{goal.target}</strong></span>
                        <span>UoM: <strong style={{color: '#1e293b'}}>{goal.uom_type}</strong></span>
                        <span>Quarter: <strong style={{color: '#1e293b'}}>{goal.quarter}</strong></span>
                      </div>
                    </div>
                    <div style={{textAlign: 'center', marginLeft: '20px'}}>
                      <div style={{fontSize: '28px', fontWeight: '700', color: '#2563eb'}}>{goal.weightage}%</div>
                      <div style={{fontSize: '11px', color: '#94a3b8'}}>weightage</div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}