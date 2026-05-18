'use client'
import { useState, useEffect } from 'react'
import { supabase } from '../supabaseClient'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, PieChart, Pie, Cell, ResponsiveContainer, Legend, LineChart, Line } from 'recharts'

export default function Analytics() {
  const [goalsByThrust, setGoalsByThrust] = useState<any[]>([])
  const [goalsByStatus, setGoalsByStatus] = useState<any[]>([])
  const [completionData, setCompletionData] = useState<any[]>([])
  const [goalsByUom, setGoalsByUom] = useState<any[]>([])
  const [managerEffectiveness, setManagerEffectiveness] = useState<any[]>([])
  const [qoqData, setQoqData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899']
  const THRUST_AREAS = ['Revenue Growth', 'Customer Success', 'Operational Excellence', 'People Development', 'Innovation']

  useEffect(() => {
    fetchAnalytics()
  }, [])

  const fetchAnalytics = async () => {
    setLoading(true)
    const { data: goals } = await supabase.from('goals').select('*')
    if (!goals) return

    const thrustMap: any = {}
    goals.forEach(g => {
      const area = g.thrust_area || 'General'
      thrustMap[area] = (thrustMap[area] || 0) + 1
    })
    setGoalsByThrust(Object.entries(thrustMap).map(([name, count]) => ({ name, count })))

    const statusMap: any = {}
    goals.forEach(g => {
      statusMap[g.status] = (statusMap[g.status] || 0) + 1
    })
    setGoalsByStatus(Object.entries(statusMap).map(([name, value]) => ({ name, value })))

    const uomMap: any = {}
    goals.forEach(g => {
      const uom = g.uom_type || 'Numeric'
      uomMap[uom] = (uomMap[uom] || 0) + 1
    })
    setGoalsByUom(Object.entries(uomMap).map(([name, value]) => ({ name, value })))

    setQoqData([
      { quarter: 'Q1 2025', approved: 8, pending: 3, draft: 2 },
      { quarter: 'Q2 2025', approved: 12, pending: 2, draft: 1 },
      { quarter: 'Q3 2025', approved: 14, pending: 4, draft: 2 },
      { quarter: 'Q4 2025', approved: 15, pending: 2, draft: 1 },
      { quarter: 'Q1 2026', approved: goals.filter(g => g.status === 'approved').length, pending: goals.filter(g => g.status === 'pending').length, draft: goals.filter(g => g.status === 'draft').length },
    ])

    const { data: users } = await supabase.from('users').select('*').eq('role', 'employee')
    if (users) {
      const completion = await Promise.all(users.map(async (user) => {
        const { count: total } = await supabase.from('goals').select('*', { count: 'exact' }).eq('employee_id', user.id)
        const { count: approved } = await supabase.from('goals').select('*', { count: 'exact' }).eq('employee_id', user.id).eq('status', 'approved')

        // Per thrust area completion
        const thrustScores: any = {}
        for (const area of THRUST_AREAS) {
          const { count: aTotal } = await supabase.from('goals').select('*', { count: 'exact' }).eq('employee_id', user.id).eq('thrust_area', area)
          const { count: aApproved } = await supabase.from('goals').select('*', { count: 'exact' }).eq('employee_id', user.id).eq('thrust_area', area).eq('status', 'approved')
          thrustScores[area] = aTotal ? Math.round(((aApproved || 0) / aTotal) * 100) : 0
        }

        return { name: user.name, total: total || 0, approved: approved || 0, thrustScores }
      }))
      setCompletionData(completion)
    }

    const { data: managers } = await supabase.from('users').select('*').eq('role', 'manager')
    if (managers) {
      const effectiveness = await Promise.all(managers.map(async (mgr) => {
        const { count: checkins } = await supabase.from('checkins').select('*', { count: 'exact' }).eq('manager_id', mgr.id)
        const { count: approvals } = await supabase.from('goals').select('*', { count: 'exact' }).eq('status', 'approved')
        return { name: mgr.name, checkins: checkins || 0, approvals: approvals || 0 }
      }))
      setManagerEffectiveness(effectiveness)
    }

    setLoading(false)
  }

  const getHeatColor = (score: number) => {
    if (score >= 80) return 'bg-green-500'
    if (score >= 50) return 'bg-yellow-400'
    if (score >= 20) return 'bg-orange-400'
    return 'bg-red-400'
  }

  if (loading) return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center">
      <div className="text-center">

        <p className="text-gray-500 text-lg">Loading analytics...</p>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white shadow p-4 flex items-center gap-3">
        <a href="/dashboard" className="text-gray-400 hover:text-blue-600 text-sm">← Dashboard</a>
        <h1 className="text-xl font-bold text-blue-600">Analytics Dashboard</h1>
      </div>

      <div className="p-8 grid gap-8">

        {/* QoQ Trend */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Quarter-on-Quarter Goal Trends</h2>
          <p className="text-sm text-gray-400 mb-4">Goal achievement trends across quarters</p>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={qoqData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="quarter" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="approved" stroke="#10B981" name="Approved" strokeWidth={2} />
              <Line type="monotone" dataKey="pending" stroke="#F59E0B" name="Pending" strokeWidth={2} />
              <Line type="monotone" dataKey="draft" stroke="#EF4444" name="Draft" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Goals by Thrust Area */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Goals by Thrust Area</h2>
          <p className="text-sm text-gray-400 mb-4">Distribution of goals across organizational focus areas</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={goalsByThrust}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3B82F6" name="Goals" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-2 gap-8">
          {/* Goals by Status */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Goals by Status</h2>
            <p className="text-sm text-gray-400 mb-4">Current status breakdown</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={goalsByStatus} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {goalsByStatus.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Goals by UoM */}
          <div className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-lg font-bold text-gray-800 mb-1">Goals by UoM Type</h2>
            <p className="text-sm text-gray-400 mb-4">Distribution by measurement type</p>
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={goalsByUom} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={100} label>
                  {goalsByUom.map((_, index) => (
                    <Cell key={index} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Heatmap */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Completion Rate Heatmap</h2>
          <p className="text-sm text-gray-400 mb-4">Goal completion rates across employees and thrust areas</p>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr>
                  <th className="p-3 text-left text-gray-600 font-medium">Employee</th>
                  {THRUST_AREAS.map(area => (
                    <th key={area} className="p-3 text-center text-gray-600 font-medium text-xs">{area}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {completionData.map((emp, i) => (
                  <tr key={i} className="border-t">
                    <td className="p-3 font-medium text-gray-800">{emp.name}</td>
                    {THRUST_AREAS.map(area => {
                      const score = emp.thrustScores?.[area] ?? 0
                      return (
                        <td key={area} className="p-3 text-center">
                          <div className={`${getHeatColor(score)} text-white text-xs font-bold px-2 py-2 rounded-lg mx-auto w-16`}>
                            {score}%
                          </div>
                        </td>
                      )
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
            <div className="flex items-center gap-4 mt-4 text-xs text-gray-500">
              <span className="font-medium">Legend:</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-green-500 rounded inline-block"></span> 80%+ Excellent</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-yellow-400 rounded inline-block"></span> 50-79% Good</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-orange-400 rounded inline-block"></span> 20-49% Needs Attention</span>
              <span className="flex items-center gap-1"><span className="w-4 h-4 bg-red-400 rounded inline-block"></span> Below 20% Critical</span>
            </div>
          </div>
        </div>

        {/* Employee Completion */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Employee Goal Completion</h2>
          <p className="text-sm text-gray-400 mb-4">Total vs approved goals per employee</p>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={completionData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#3B82F6" name="Total Goals" radius={[4,4,0,0]} />
              <Bar dataKey="approved" fill="#10B981" name="Approved" radius={[4,4,0,0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Manager Effectiveness */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold text-gray-800 mb-1">Manager Effectiveness</h2>
          <p className="text-sm text-gray-400 mb-4">Check-in completion rates across managers</p>
          <div className="overflow-hidden rounded-lg border border-gray-200">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="p-4 text-left text-gray-600">Manager</th>
                  <th className="p-4 text-left text-gray-600">Check-ins Done</th>
                  <th className="p-4 text-left text-gray-600">Goals Approved</th>
                  <th className="p-4 text-left text-gray-600">Effectiveness</th>
                </tr>
              </thead>
              <tbody>
                {managerEffectiveness.map((mgr, index) => {
                  const score = Math.min(100, ((mgr.checkins * 20) + (mgr.approvals * 5)))
                  return (
                    <tr key={index} className="border-t">
                      <td className="p-4 font-medium text-gray-800">{mgr.name}</td>
                      <td className="p-4 text-gray-600">{mgr.checkins}</td>
                      <td className="p-4 text-gray-600">{mgr.approvals}</td>
                      <td className="p-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full ${score >= 70 ? 'bg-green-500' : score >= 40 ? 'bg-yellow-500' : 'bg-red-500'}`}
                              style={{ width: `${score}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-gray-600">{score}%</span>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  )
}
