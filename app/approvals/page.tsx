'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'

export default function Approvals() {
  const [goals, setGoals] = useState<any[]>([])
  const [message, setMessage] = useState('')
  const [messageType, setMessageType] = useState('info')
  const [loading, setLoading] = useState(true)

  const showToast = (msg: string, type: string = 'info') => {
    setMessage(msg)
    setMessageType(type)
    setTimeout(() => setMessage(''), 3000)
  }

  useEffect(() => {
    fetchPendingGoals()
  }, [])

  const fetchPendingGoals = async () => {
    setLoading(true)
    const { data } = await supabase
      .from('goals')
      .select('*')
      .eq('status', 'pending')
    setGoals(data || [])
    setLoading(false)
  }

  const handleApprove = async (goalId: any) => {
    await supabase
      .from('goals')
      .update({ status: 'approved', locked: true })
      .eq('id', goalId)
    showToast('✅ Goal approved and locked!', 'success')
    fetchPendingGoals()
  }

  const handleReject = async (goalId: any) => {
    await supabase
      .from('goals')
      .update({ status: 'draft' })
      .eq('id', goalId)
    showToast('↩ Goal sent back for rework!', 'info')
    fetchPendingGoals()
  }

  const handleEdit = async (goalId: any, field: string, value: any) => {
    await supabase
      .from('goals')
      .update({ [field]: value })
      .eq('id', goalId)
    fetchPendingGoals()
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">Loading pending approvals...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium ${
          messageType === 'success' ? 'bg-green-500' :
          messageType === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white shadow p-4 flex items-center gap-3">
        <a href="/dashboard" className="text-gray-400 hover:text-blue-600 text-sm">← Dashboard</a>
        <h1 className="text-xl font-bold text-blue-600">Manager Approvals</h1>
      </div>

      <div className="p-8">
        {goals.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-6xl mb-4">✅</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">All Caught Up!</h3>
            <p className="text-gray-400">No pending goals to approve right now.</p>
            <a href="/dashboard" className="inline-block mt-6 bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700">
              Back to Dashboard
            </a>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <GoalCard
                key={goal.id}
                goal={goal}
                onApprove={handleApprove}
                onReject={handleReject}
                onEdit={handleEdit}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

function GoalCard({ goal, onApprove, onReject, onEdit }: { goal: any, onApprove: any, onReject: any, onEdit: any }) {
  const [target, setTarget] = useState(goal.target)
  const [weightage, setWeightage] = useState(goal.weightage)
  const [editing, setEditing] = useState(false)

  const handleSaveEdit = () => {
    onEdit(goal.id, 'target', Number(target))
    onEdit(goal.id, 'weightage', Number(weightage))
    setEditing(false)
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="flex justify-between items-start">
        <div className="flex-1">
          <h3 className="text-lg font-bold text-gray-800">{goal.title}</h3>
          <p className="text-gray-500 text-sm mt-1">{goal.description}</p>
          <p className="text-gray-400 text-xs mt-1">
            Thrust Area: <strong>{goal.thrust_area || 'General'}</strong> |
            UoM: <strong>{goal.uom_type}</strong>
          </p>

          {editing ? (
            <div className="mt-3 grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm text-gray-600">Target</label>
                <input
                  type="number"
                  value={target}
                  onChange={(e) => setTarget(e.target.value)}
                  className="w-full border p-2 rounded bg-gray-50 text-gray-800"
                />
              </div>
              <div>
                <label className="text-sm text-gray-600">Weightage %</label>
                <input
                  type="number"
                  value={weightage}
                  onChange={(e) => setWeightage(e.target.value)}
                  className="w-full border p-2 rounded bg-gray-50 text-gray-800"
                />
              </div>
              <button
                onClick={handleSaveEdit}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                Save Changes
              </button>
              <button
                onClick={() => setEditing(false)}
                className="bg-gray-400 text-white px-4 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          ) : (
            <p className="text-gray-600 text-sm mt-2">
              Target: <strong>{goal.target}</strong> |
              Weightage: <strong>{goal.weightage}%</strong>
            </p>
          )}
        </div>

        <div className="flex flex-col gap-2 ml-4">
          <button
            onClick={() => onApprove(goal.id)}
            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
          >
            ✅ Approve
          </button>
          <button
            onClick={() => setEditing(!editing)}
            className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
          >
            ✏️ Edit
          </button>
          <button
            onClick={() => onReject(goal.id)}
            className="bg-red-500 text-white px-4 py-2 rounded hover:bg-red-600"
          >
            ↩ Return
          </button>
        </div>
      </div>
    </div>
  )
}