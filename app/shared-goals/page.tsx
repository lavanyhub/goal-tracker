'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function SharedGoals() {
  const [employees, setEmployees] = useState<any[]>([])
  const [sharedGoals, setSharedGoals] = useState<any[]>([])
  const [thrustArea, setThrustArea] = useState('')
  const [uom, setUom] = useState('Numeric')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState('')
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('success')

  useEffect(() => {
    fetchEmployees()
    fetchSharedGoals()
  }, [])

  const fetchEmployees = async () => {
    const { data } = await supabase.from('users').select('*').eq('role', 'employee')
    setEmployees(data || [])
  }

  const fetchSharedGoals = async () => {
    const { data } = await supabase.from('goals').select('*, users(name,email)').eq('is_shared', true)
    setSharedGoals(data || [])
  }

  const showToast = (msg: string, type: string = 'success') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  const handlePush = async () => {
    if (!title || !target || selectedEmployees.length === 0) {
      showToast('Please fill all fields and select at least one employee!', 'error')
      return
    }
    for (const empId of selectedEmployees) {
      await supabase.from('goals').insert({
        employee_id: empId,
        thrust_area: thrustArea,
        uom_type: uom,
        title,
        description,
        target: Number(target),
        weightage: 10,
        status: 'approved',
        locked: true,
        quarter: 'Q1',
        is_shared: true
      })
    }
    showToast('Goal pushed to selected employees!')
    setTitle('')
    setDescription('')
    setTarget('')
    setSelectedEmployees([])
    fetchSharedGoals()
  }

  return (
    <div style={{minHeight: '100vh', backgroundColor: '#f1f5f9', padding: '32px'}}>
      {message && (
        <div style={{position: 'fixed', top: '20px', right: '20px', zIndex: 999, padding: '12px 20px', borderRadius: '8px', color: 'white', fontWeight: '500', backgroundColor: messageType === 'success' ? '#22c55e' : '#ef4444'}}>
          {message}
        </div>
      )}
      <div style={{maxWidth: '1100px', margin: '0 auto'}}>
        <h1 style={{fontSize: '24px', fontWeight: '700', color: '#1e293b', marginBottom: '4px'}}>Shared Goals</h1>
        <p style={{fontSize: '14px', color: '#64748b', marginBottom: '32px'}}>Push goals to multiple employees at once</p>

        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px'}}>
          {/* Push Form */}
          <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
            <h2 style={{fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px'}}>Push Goal to Employees</h2>
            <select value={thrustArea} onChange={(e) => setThrustArea(e.target.value)}
              style={{width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc', marginBottom: '12px', boxSizing: 'border-box'}}>
              <option value="">Select Thrust Area</option>
              <option value="Revenue Growth">Revenue Growth</option>
              <option value="Customer Success">Customer Success</option>
              <option value="Operational Excellence">Operational Excellence</option>
              <option value="People Development">People Development</option>
              <option value="Innovation">Innovation</option>
            </select>
            <select value={uom} onChange={(e) => setUom(e.target.value)}
              style={{width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc', marginBottom: '12px', boxSizing: 'border-box'}}>
              <option value="Numeric">Numeric</option>
              <option value="%">Percentage (%)</option>
              <option value="Timeline">Timeline</option>
              <option value="Zero-based">Zero-based</option>
            </select>
            <input type="text" placeholder="Goal Title" value={title} onChange={(e) => setTitle(e.target.value)}
              style={{width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc', marginBottom: '12px', boxSizing: 'border-box'}}/>
            <textarea placeholder="Description (optional)" value={description} onChange={(e) => setDescription(e.target.value)}
              style={{width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc', marginBottom: '12px', boxSizing: 'border-box', height: '80px', resize: 'none'}}/>
            <input type="number" placeholder="Target Value" value={target} onChange={(e) => setTarget(e.target.value)}
              style={{width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0', borderRadius: '8px', fontSize: '14px', color: '#1e293b', backgroundColor: '#f8fafc', marginBottom: '16px', boxSizing: 'border-box'}}/>
            <p style={{fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px'}}>Select Employees:</p>
            {employees.map(emp => (
              <label key={emp.id} style={{display: 'flex', alignItems: 'center', gap: '8px', padding: '8px 12px', backgroundColor: selectedEmployees.includes(emp.id) ? '#eff6ff' : '#f8fafc', borderRadius: '8px', marginBottom: '8px', cursor: 'pointer', border: '1px solid #e2e8f0'}}>
                <input type="checkbox" checked={selectedEmployees.includes(emp.id)}
                  onChange={(e) => {
                    if (e.target.checked) setSelectedEmployees([...selectedEmployees, emp.id])
                    else setSelectedEmployees(selectedEmployees.filter(id => id !== emp.id))
                  }}/>
                <div>
                  <p style={{fontSize: '14px', fontWeight: '500', color: '#1e293b', margin: 0}}>{emp.name}</p>
                  <p style={{fontSize: '12px', color: '#64748b', margin: 0}}>{emp.email}</p>
                </div>
              </label>
            ))}
            <button onClick={handlePush}
              style={{width: '100%', backgroundColor: '#2563eb', color: 'white', border: 'none', padding: '12px', borderRadius: '8px', fontSize: '14px', fontWeight: '600', cursor: 'pointer', marginTop: '8px'}}>
              Push Goal to Selected Employees
            </button>
          </div>

          {/* Previously Shared */}
          <div style={{backgroundColor: 'white', borderRadius: '12px', padding: '24px', border: '1px solid #e2e8f0'}}>
            <h2 style={{fontSize: '16px', fontWeight: '600', color: '#1e293b', marginBottom: '16px'}}>Previously Shared Goals</h2>
            {sharedGoals.length === 0 ? (
              <div style={{textAlign: 'center', padding: '40px', color: '#94a3b8'}}>No shared goals yet</div>
            ) : (
              sharedGoals.map(goal => (
                <div key={goal.id} style={{padding: '16px', backgroundColor: '#f8fafc', borderRadius: '8px', marginBottom: '12px', border: '1px solid #e2e8f0'}}>
                  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
                    <div>
                      <span style={{fontSize: '12px', backgroundColor: '#eff6ff', color: '#2563eb', padding: '2px 8px', borderRadius: '20px'}}>{goal.thrust_area}</span>
                      <h3 style={{fontSize: '15px', fontWeight: '600', color: '#1e293b', margin: '6px 0 2px 0'}}>{goal.title}</h3>
                      <p style={{fontSize: '12px', color: '#64748b', margin: 0}}>{goal.users?.name} — Target: {goal.target}</p>
                    </div>
                    <span style={{fontSize: '12px', backgroundColor: '#f0fdf4', color: '#16a34a', padding: '2px 8px', borderRadius: '20px', fontWeight: '600'}}>SHARED</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}