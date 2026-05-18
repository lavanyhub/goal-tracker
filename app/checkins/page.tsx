'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Checkins() {
  const [employees, setEmployees] = useState([])
  const [selectedEmployee, setSelectedEmployee] = useState(null)
  const [goals, setGoals] = useState([])
  const [comment, setComment] = useState('')
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchEmployees()
  }, [])

  const fetchEmployees = async () => {
    const { data } = await supabase
      .from('users')
      .select('*')
      .eq('role', 'employee')
    setEmployees(data || [])
  }

  const fetchEmployeeGoals = async (employeeId) => {
    const { data: goalsData } = await supabase
      .from('goals')
      .select('*')
      .eq('employee_id', employeeId)
      .eq('status', 'approved')

    if (goalsData) {
      const goalsWithAchievements = await Promise.all(
        goalsData.map(async (goal) => {
          const { data: achievement } = await supabase
            .from('achievements')
            .select('*')
            .eq('goal_id', goal.id)
            .eq('quarter', 'Q1')
            .single()
          return { ...goal, achievement }
        })
      )
      setGoals(goalsWithAchievements)
    }
  }

  const handleSelectEmployee = (employee) => {
    setSelectedEmployee(employee)
    fetchEmployeeGoals(employee.id)
  }

  const handleCheckin = async () => {
    if (!comment) {
      setMessage('Please add a comment!')
      return
    }
    const { data: { user } } = await supabase.auth.getUser()
    const { data: managerData } = await supabase
      .from('users')
      .select('id')
      .eq('email', user.email)
      .single()

    await supabase.from('checkins').insert({
      manager_id: managerData.id,
      employee_id: selectedEmployee.id,
      quarter: 'Q1',
      comment
    })
    setMessage('Check-in saved successfully!')
    setComment('')
  }

  const exportCSV = () => {
    const rows = [
      ['Employee', 'Goal Title', 'Thrust Area', 'Target', 'Actual', 'Status', 'Score']
    ]
    goals.forEach(goal => {
      const actual = goal.achievement?.actual_value || 0
      const score = Math.min(Math.round((actual / goal.target) * 100), 100)
      rows.push([
        selectedEmployee.name,
        goal.title,
        goal.thrust_area || 'General',
        goal.target,
        actual,
        goal.achievement?.status || 'Not Started',
        score + '%'
      ])
    })
    const csv = rows.map(r => r.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${selectedEmployee.name}_Q1_Report.csv`
    a.click()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-blue-600">Manager Check-ins</h1>
      </div>

      <div className="p-8 grid grid-cols-4 gap-6">
        <div className="col-span-1">
          <h2 className="font-bold text-gray-700 mb-3">Team Members</h2>
          {employees.map(emp => (
            <div
              key={emp.id}
              onClick={() => handleSelectEmployee(emp)}
              className={`p-3 rounded-lg cursor-pointer mb-2 ${
                selectedEmployee?.id === emp.id
                  ? 'bg-blue-600 text-white'
                  : 'bg-white hover:bg-blue-50'
              }`}
            >
              <p className="font-medium">{emp.name}</p>
              <p className="text-xs opacity-75">{emp.email}</p>
            </div>
          ))}
        </div>

        <div className="col-span-3">
          {!selectedEmployee ? (
            <div className="bg-white p-8 rounded-lg shadow text-center text-gray-400">
              Select a team member to view their goals
            </div>
          ) : (
            <div>
              <div className="flex justify-between items-center mb-4">
                <h2 className="font-bold text-xl text-gray-800">
                  {selectedEmployee.name}'s Goals
                </h2>
                <button
                  onClick={exportCSV}
                  className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                >
                  📥 Export CSV
                </button>
              </div>

              {message && (
                <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
                  {message}
                </div>
              )}

              <div className="grid gap-4 mb-6">
                {goals.map(goal => {
                  const actual = goal.achievement?.actual_value || 0
                  const score = Math.min(Math.round((actual / goal.target) * 100), 100)
                  return (
                    <div key={goal.id} className="bg-white p-4 rounded-lg shadow">
                      <div className="flex justify-between items-center">
                        <div>
                          <h3 className="font-bold text-gray-800">{goal.title}</h3>
                          <p className="text-sm text-gray-500">
                            Target: <strong>{goal.target}</strong> |
                            Actual: <strong>{actual}</strong> |
                            Status: <strong>{goal.achievement?.status || 'Not Started'}</strong>
                          </p>
                        </div>
                        <div className={`text-2xl font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
                          {score}%
                        </div>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                        <div
                          className={`h-2 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="font-bold text-gray-800 mb-3">Add Check-in Comment</h3>
                <textarea
                  placeholder="Write your check-in comment here..."
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full border p-2 rounded bg-gray-50 text-gray-800 h-24"
                />
                <button
                  onClick={handleCheckin}
                  className="mt-3 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
                >
                  Save Check-in
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}