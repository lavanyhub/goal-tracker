'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Achievements() {
  const [goals, setGoals] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [message, setMessage] = useState('')

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
        .eq('status', 'approved')
      setGoals(data || [])
    }
  }

  const handleUpdateAchievement = async (goalId: any, actualValue: any, status: any) => {
    const { error } = await supabase
      .from('achievements')
      .upsert({
        goal_id: goalId,
        quarter: 'Q1',
        actual_value: Number(actualValue),
        status: status
      }, { onConflict: 'goal_id,quarter' })

    if (error) {
      setMessage('Error updating achievement!')
    } else {
      setMessage('Achievement updated successfully!')
    }
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-blue-600">Q1 Achievement Tracking</h1>
      </div>

      <div className="p-8">
        {message && (
          <div className="bg-green-100 text-green-800 p-3 rounded mb-4">
            {message}
          </div>
        )}

        {goals.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-400">
            No approved goals found! Goals must be approved before tracking achievements.
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <AchievementCard
                key={goal.id}
                goal={goal}
                onUpdate={handleUpdateAchievement}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function AchievementCard({ goal, onUpdate }: { goal: any, onUpdate: any }) {
  const [actualValue, setActualValue] = useState('')
  const [status, setStatus] = useState('Not Started')

  const getScore = () => {
    if (!actualValue) return 0
    const actual = Number(actualValue)
    const target = Number(goal.target)
    if (goal.uom_type === 'Zero-based') return actual === 0 ? 100 : 0
    if (goal.uom_type === 'Timeline') return actual <= target ? 100 : Math.max(0, Math.round((target / actual) * 100))
    if (goal.uom_type === '%') return Math.min(Math.round((actual / target) * 100), 100)
    return Math.min(Math.round((actual / target) * 100), 100)
  }

  const score = getScore()

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start mb-4">
        <div>
          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
            {goal.thrust_area || 'General'}
          </span>
          <h3 className="text-lg font-bold text-gray-800 mt-2">{goal.title}</h3>
          <p className="text-gray-500 text-sm">
            Target: <strong>{goal.target}</strong> | UoM: <strong>{goal.uom_type}</strong> | Weightage: <strong>{goal.weightage}%</strong>
          </p>
        </div>
        <div className="text-center">
          <div className={`text-3xl font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-yellow-600' : 'text-red-600'}`}>
            {score}%
          </div>
          <p className="text-xs text-gray-500">Progress Score</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Actual Achievement</label>
          <input
            type="number"
            placeholder="Enter actual value"
            value={actualValue}
            onChange={(e) => setActualValue(e.target.value)}
            className="w-full border p-2 rounded bg-gray-50 text-gray-800"
          />
        </div>
        <div>
          <label className="text-sm text-gray-600 mb-1 block">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border p-2 rounded bg-gray-50 text-gray-800"
          >
            <option value="Not Started">Not Started</option>
            <option value="On Track">On Track</option>
            <option value="Completed">Completed</option>
          </select>
        </div>
      </div>

      <div className="mt-3">
        <div className="w-full bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full ${score >= 80 ? 'bg-green-500' : score >= 50 ? 'bg-yellow-500' : 'bg-red-500'}`}
            style={{ width: `${score}%` }}
          />
        </div>
      </div>

      <button
        onClick={() => onUpdate(goal.id, actualValue, status)}
        className="mt-4 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
      >
        Save Achievement
      </button>
    </div>
  )
}