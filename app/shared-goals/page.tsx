'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function SharedGoals() {
  const [employees, setEmployees] = useState<any[]>([])
  const [selectedEmployees, setSelectedEmployees] = useState<string[]>([])
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [target, setTarget] = useState('')
  const [thrustArea, setThrustArea] = useState('')
  const [uom, setUom] = useState('Numeric')
  const [message, setMessage] = useState('')
  const [sharedGoals, setSharedGoals] = useState<any[]>([])

  useEffect(() => {
    fetchEmployees()
    fetchSharedGoals()
  }, [])

  const fetchEmployees = async () => {
    const { data } = await supabase.from('users').select('*').eq('role', 'employee')
    setEmployees(data || [])
  }

  const fetchSharedGoals = async () => {
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('is_shared', true)
      .eq('is_primary_owner', true)
    setSharedGoals(data || [])
  }

  const toggleEmployee = (id: string) => {
    setSelectedEmployees(prev =>
      prev.includes(id) ? prev.filter(e => e !== id) : [...prev, id]
    )
  }

  const handlePushGoal = async () => {
    if (!title || !target || !thrustArea || selectedEmployees.length === 0) {
      setMessage('Please fill all fields and select at least one employee!')
      return
    }

    for (let i = 0; i < selectedEmployees.length; i++) {
      const empId = selectedEmployees[i]
      await supabase.from('goals').insert({
        employee_id: empId,
        title,
        description,
        target: Number(target),
        weightage: 10,
        status: 'draft',
        locked: false,
        quarter: 'Q1',
        thrust_area: thrustArea,
        uom_type: uom,
        is_shared: true,
        is_primary_owner: i === 0
      })
    }

    setMessage(`Goal pushed to ${selectedEmployees.length} employees!`)
    setTitle('')
    setDescription('')
    setTarget('')
    setThrustArea('')
    setSelectedEmployees([])
    fetchSharedGoals()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-blue-600">Shared Goals</h1>
      </div>

      <div className="p-8 grid grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Push Goal to Employees</h2>

          {message && (
            <div className="bg-green-100 text-green-800 p-3 rounded mb-4">{message}</div>
          )}

          <select
            value={thrustArea}
            onChange={(e) => setThrustArea(e.target.value)}
            className="w-full border p-2 rounded mb-3 bg-gray-50 text-gray-800"
          >
            <option value="">Select Thrust Area</option>
            <option value="Revenue Growth">Revenue Growth</option>
            <option value="Customer Success">Customer Success</option>
            <option value="Operational Excellence">Operational Excellence</option>
            <option value="People Development">People Development</option>
            <option value="Innovation">Innovation</option>
          </select>

          <select
            value={uom}
            onChange={(e) => setUom(e.target.value)}
            className="w-full border p-2 rounded mb-3 bg-gray-50 text-gray-800"
          >
            <option value="Numeric">Numeric</option>
            <option value="%">Percentage (%)</option>
            <option value="Timeline">Timeline</option>
            <option value="Zero-based">Zero-based</option>
          </select>

          <input
            type="text"
            placeholder="Goal Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full border p-2 rounded mb-3 bg-gray-50 text-gray-800"
          />

          <textarea
            placeholder="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full border p-2 rounded mb-3 bg-gray-50 text-gray-800"
          />

          <input
            type="number"
            placeholder="Target Value"
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            className="w-full border p-2 rounded mb-3 bg-gray-50 text-gray-800"
          />

          <h3 className="font-medium text-gray-700 mb-2">Select Employees:</h3>
          <div className="grid gap-2 mb-4">
            {employees.map(emp => (
              <label key={emp.id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedEmployees.includes(emp.id)}
                  onChange={() => toggleEmployee(emp.id)}
                />
                <span className="text-gray-700">{emp.name} ({emp.email})</span>
              </label>
            ))}
          </div>

          <button
            onClick={handlePushGoal}
            className="w-full bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
          >
            Push Goal to Selected Employees
          </button>
        </div>

        <div>
          <h2 className="text-lg font-bold text-gray-800 mb-4">Previously Shared Goals</h2>
          {sharedGoals.length === 0 ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-400">
              No shared goals yet!
            </div>
          ) : (
            <div className="grid gap-4">
              {sharedGoals.map(goal => (
                <div key={goal.id} className="bg-white p-4 rounded-lg shadow">
                  <h3 className="font-bold text-gray-800">{goal.title}</h3>
                  <p className="text-sm text-gray-500">{goal.thrust_area} | {goal.uom_type}</p>
                  <p className="text-sm text-gray-600">Target: {goal.target}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}