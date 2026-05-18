'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Approvals() {
  const [goals, setGoals] = useState([])
  const [message, setMessage] = useState('')

  useEffect(() => {
    fetchPendingGoals()
  }, [])

  const fetchPendingGoals = async () => {
    const { data, error } = await supabase
      .from('goals')
      .select('*')
      .eq('status', 'pending')
    console.log('goals:', data, 'error:', error)
    setGoals(data || [])
  }

  const handleApprove = async (goalId) => {
    await supabase
      .from('goals')
      .update({ status: 'approved', locked: true })
      .eq('id', goalId)
    setMessage('Goal approved and locked!')
    fetchPendingGoals()
  }

  const handleReject = async (goalId) => {
    await supabase
      .from('goals')
      .update({ status: 'draft' })
      .eq('id', goalId)
    setMessage('Goal sent back for rework!')
    fetchPendingGoals()
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4">
        <h1 className="text-xl font-bold text-blue-600">Manager Approvals</h1>
      </div>

      <div className="p-8">
        {message && (
          <div className="bg-yellow-100 text-yellow-800 p-3 rounded mb-4">
            {message}
          </div>
        )}

        {goals.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center text-gray-400">
            No pending approvals!
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-sm text-gray-500 mb-1">
                      👤 {goal.users?.name} ({goal.users?.email})
                    </p>
                    <h3 className="text-lg font-bold text-gray-800">{goal.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{goal.description}</p>
                    <p className="text-gray-600 text-sm mt-2">
                      Target: <strong>{goal.target}</strong> | 
                      Weightage: <strong>{goal.weightage}%</strong>
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleApprove(goal.id)}
                      className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                    >
                      ✅ Approve
                    </button>
                    <button
                      onClick={() => handleReject(goal.id)}
                      className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
                    >
                      ↩ Return
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}