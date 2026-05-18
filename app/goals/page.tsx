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
  const [messageType, setMessageType] = useState('info')
  const [loading, setLoading] = useState(true)

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
    setLoading(true)
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
    setLoading(false)
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

    showToast('✅ Goals submitted for approval!', 'success')
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
      showToast('✅ Goal added successfully!', 'success')
      setTitle('')
      setDescription('')
      setTarget('')
      setWeightage('')
      setShowForm(false)
      fetchGoals(user.email)
    }
  }

  const phase = getActivePhase()

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-500 text-lg">Loading your goals...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      {message && (
        <div className={`fixed top-4 right-4 z-50 px-6 py-3 rounded-lg shadow-lg text-white font-medium transition-all ${
          messageType === 'success' ? 'bg-green-500' :
          messageType === 'error' ? 'bg-red-500' : 'bg-blue-500'
        }`}>
          {message}
        </div>
      )}

      <div className="bg-white shadow p-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <a href="/dashboard" className="text-gray-400 hover:text-blue-600 text-sm">← Dashboard</a>
          <h1 className="text-xl font-bold text-blue-600">My Goals</h1>
        </div>
        <div className="flex items-center gap-4">
          <span className={`text-sm font-medium ${totalWeightage === 100 ? 'text-green-600' : 'text-gray-600'}`}>
            Weightage: <strong>{totalWeightage}%</strong> / 100%
          </span>
          {phase === 'GOAL_SETTING' ? (
            <>
              <button
                onClick={handleSubmitAll}
                className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
              >
                Submit for Approval
              </button>
              <button
                onClick={() => setShowForm(!showForm)}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
              >
                + Add Goal
              </button>
            </>
          ) : (
            <span className="text-sm text-red-500 font-medium">
              Goal setting closed. Current phase: {phase}
            </span>
          )}
        </div>
      </div>

      <div className="p-8">
        {showForm && (
          <div className="bg-white p-6 rounded-lg shadow mb-6">
            <h2 className="text-lg font-bold mb-4 text-gray-800">Add New Goal</h2>
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
            <div className="grid grid-cols-2 gap-4">
              <input
                type="number"
                placeholder="Target Value"
                value={target}
                onChange={(e) => setTarget(e.target.value)}
                className="w-full border p-2 rounded bg-gray-50 text-gray-800"
              />
              <input
                type="number"
                placeholder="Weightage % (min 10%)"
                value={weightage}
                onChange={(e) => setWeightage(e.target.value)}
                className="w-full border p-2 rounded bg-gray-50 text-gray-800"
              />
            </div>
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleAddGoal}
                className="bg-green-600 text-white px-6 py-2 rounded hover:bg-green-700"
              >
                Save Goal
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="bg-gray-400 text-white px-6 py-2 rounded hover:bg-gray-500"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {goals.length === 0 ? (
          <div className="bg-white p-12 rounded-lg shadow text-center">
            <div className="text-6xl mb-4">🎯</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No Goals Yet</h3>
            <p className="text-gray-400 mb-6">Start by adding your first goal for this quarter!</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-blue-600 text-white px-6 py-2 rounded hover:bg-blue-700"
            >
              + Add Your First Goal
            </button>
          </div>
        ) : (
          <div className="grid gap-4">
            {goals.map((goal) => (
              <div key={goal.id} className="bg-white p-6 rounded-lg shadow">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-lg font-bold text-gray-800">{goal.title}</h3>
                    <p className="text-gray-500 text-sm mt-1">{goal.description}</p>
                    <p className="text-gray-400 text-xs mt-1">{goal.thrust_area} | {goal.uom_type}</p>
                  </div>
                  <div className="text-right">
                    <span className="bg-blue-100 text-blue-600 px-3 py-1 rounded-full text-sm font-medium">
                      {goal.weightage}%
                    </span>
                    <p className="text-gray-500 text-sm mt-1">Target: {goal.target}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    goal.status === 'approved' ? 'bg-green-100 text-green-600' :
                    goal.status === 'pending' ? 'bg-yellow-100 text-yellow-600' :
                    'bg-gray-100 text-gray-600'
                  }`}>
                    {goal.status.toUpperCase()}
                  </span>
                  {goal.locked && <span className="ml-2 text-xs text-gray-400">🔒 Locked</span>}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}